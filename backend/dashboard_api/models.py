from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.exceptions import ValidationError
from django.utils.timezone import now

user_types=[
    ('supervisor', 'Supervisor'),
    ('employee', 'Empleado'),
    ('analyst', 'Analista'),
    ('admin', 'Administrador')
]


class HealthFirstUser(AbstractUser):
    first_name=models.CharField(max_length=15,null=False, blank=False)
    last_name=models.CharField(max_length=15,null=False, blank=False)
    date_of_birth = models.DateField(null=True, blank=True)
    email = models.EmailField(unique=True)
    phone=models.CharField(max_length=15,null=False, blank=False)
    user_type=models.CharField(max_length=15, choices=user_types, default='employee')
    dni=models.IntegerField(unique=True,null=False, blank=False)
    is_deleted=models.BooleanField(default=False)
    delete_at=models.DateTimeField(null=True, blank=True,default=None)


    def save(self, *args, **kwargs):
        if not self.username and self.dni:
            self.username = str(self.dni)
        
        if self.user_type not in dict(user_types).keys():
            raise ValidationError("El tipo de usuario no es válido.")
        self.clean()
        super().save(*args, **kwargs)

    def delete(self, *args, **kwargs):
        self.is_deleted = True
        self.delet_at=now()
        self.save()

    @classmethod
    def user_types(cls):
        return dict(user_types).keys()

    @classmethod
    def get_users(cls, user_type=None):
        if user_type:
            users= cls.objects.filter(user_type=user_type, is_deleted=False)
        else:
            users=cls.objects.filter(is_deleted=False)

        return users


