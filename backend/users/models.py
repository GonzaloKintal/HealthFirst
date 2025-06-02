from datetime import datetime
from this import d
from django.utils import timezone
from django.conf import settings
from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.exceptions import ValidationError
from django.utils.timezone import now
from datetime import datetime, date
from dateutil.relativedelta import relativedelta
from datetime import datetime, date


user_roles=[
    ('supervisor', 'Supervisor'),
    ('employee', 'Empleado'),
    ('analyst', 'Analista'),
    ('admin', 'Administrador')
]

class AgeAtEmploymentError(Exception):
    """Excepción personalizada para antiguedad."""
    pass



class Department(models.Model):
    department_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name


class Role(models.Model):
    role_id = models.AutoField(primary_key=True)
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    deleted_at = models.DateTimeField(blank=True, null=True)
    is_deleted = models.BooleanField(default=False)

    def __str__(self):
        return self.name

    @classmethod
    def get_or_create(cls, name):
        if name not in dict(user_roles).keys():
            raise ValidationError("El tipo de usuario no es válido.")
        role, created = cls.objects.get_or_create(name=name)
        return role

class HealthFirstUser(AbstractUser):
    first_name=models.CharField(max_length=15,null=False, blank=False)
    last_name=models.CharField(max_length=15,null=False, blank=False)
    role = models.ForeignKey(Role, on_delete=models.CASCADE, null=True, blank=True, related_name='users')
    department = models.ForeignKey(Department, on_delete=models.CASCADE, null=True, blank=True, related_name='users')
    date_of_birth = models.DateField(null=True, blank=True)
    email = models.EmailField(unique=True)
    employment_start_date=models.DateField(null=False, blank=False)
    phone=models.CharField(max_length=15,null=False, blank=False)
    dni=models.IntegerField(null=False, blank=False)
    is_deleted=models.BooleanField(default=False)
    delete_at=models.DateTimeField(null=True, blank=True,default=None)
    employment_start_date=models.DateField(null=True, blank=True)


    def save(self, *args, **kwargs):
        # Asegurar campos de tipo `date`
        date_format = "%Y-%m-%d"
        from datetime import datetime, date

        date_format = "%Y-%m-%d"

        if isinstance(self.date_of_birth, str):
            birth_date = datetime.strptime(self.date_of_birth, date_format).date()
        else:
            birth_date = self.date_of_birth

        if isinstance(self.employment_start_date, str):
            employment_date = datetime.strptime(self.employment_start_date, date_format).date()
        else:
            employment_date = self.employment_start_date


        # calcular edad
        age_at_employment = relativedelta(employment_date, birth_date).years

        if age_at_employment < 18:
          raise AgeAtEmploymentError("Fecha de ingreso incorrecta. Un empleado puede ingresar a partir de los 18 años")
        
        if self.pk is None:
            existing_user = HealthFirstUser.objects.filter(email=self.email, is_deleted=True).first()
            if existing_user:
                existing_user.is_deleted = False
                existing_user.delete_at = None
                existing_user.first_name = self.first_name
                existing_user.last_name = self.last_name
                existing_user.dni = self.dni
                existing_user.date_of_birth = self.date_of_birth
                existing_user.phone = self.phone
                existing_user.role = self.role
                existing_user.department = self.department
                existing_user.employment_start_date = self.employment_start_date
                existing_user.set_password(self.password)
                existing_user.save()
                self.pk = existing_user.pk 
                return 

        if (not self.username and self.email) or (self.username != self.email):
            self.username = str(self.email)
        self.clean()
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        self.is_deleted = True
        self.delete_at=now()
        super().save(*args, **kwargs)

    @classmethod
    def user_roles(cls):
        return dict(user_roles).keys()

    @classmethod
    def get_users(cls, role_name=None):
        if role_name:
            users= cls.objects.filter(role__name=role_name, is_deleted=False)
        else:
            users=cls.objects.filter(is_deleted=False)

        return users

    @classmethod
    def get_user(cls, id):
        user = cls.objects.get(id=id, is_deleted=False)
        return user
