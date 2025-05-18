from rest_framework import serializers
from .models import Department, HealthFirstUser
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.exceptions import AuthenticationFailed



class HealthFirstUserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    role = serializers.SlugRelatedField(read_only=True, slug_field='name')
    department = serializers.SlugRelatedField(read_only=True, slug_field='name')
    
    class Meta:
        model = HealthFirstUser
        fields = ['id','full_name', 'first_name', 'last_name','dni', 'date_of_birth', 'phone', 'role', 'email','department','employment_start_date']

    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}"
    

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        if user.is_deleted:
            raise AuthenticationFailed('El usuario no existe.')
        
        token['id'] = user.id
        token['email'] = user.email
        token['role'] = user.role.name
 
            
        return token

    def validate(self, attrs):
        data = super().validate(attrs)

        data.update({
            'username': self.user.username,
            'email': self.user.email,
            'role': self.user.role.name if hasattr(self.user, 'role') and self.user.role else 'user',
            'id': self.user.id,
        })
        
        return data


class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = ['department_id', 'name','description'] 
