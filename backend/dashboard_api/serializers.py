from rest_framework import serializers
from .models import HealthFirstUser, License
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


class HealthFirstUserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    role = serializers.SlugRelatedField(read_only=True, slug_field='name')
    department = serializers.SlugRelatedField(read_only=True, slug_field='name')

    class Meta:
        model = HealthFirstUser
        fields = ['id','full_name', 'first_name', 'last_name','dni', 'date_of_birth', 'phone', 'role', 'email', 'department']

    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}"
    

class LicenseSerializer(serializers.ModelSerializer):
    employee = serializers.CharField(source='user.get_full_name')
    days = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()
    user = HealthFirstUserSerializer(read_only=True)

    class Meta:
        model = License
        fields = ['user', 'license_id', 'user_id', 'employee', 'type', 'start_date', 'end_date', 'days', 'status', 'information']

    def get_days(self, obj):
        return (obj.end_date - obj.start_date).days + 1

    def get_status(self, obj):
        if obj.justified:
            return 'Approved'
        elif obj.closing_date:
            return 'Rejected'
        else:
            return 'Pending'    


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        
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

