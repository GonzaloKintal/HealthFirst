from rest_framework import serializers
from .models import HealthFirstUser, License


class HealthFirstUserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    role = serializers.SlugRelatedField(read_only=True, slug_field='name')

    class Meta:
        model = HealthFirstUser
        fields = ['id', 'full_name', 'role','email']

    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}"
    

class LicenseSerializer(serializers.ModelSerializer):
    employee = serializers.CharField(source='user.get_full_name')
    days = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()

    class Meta:
        model = License
        fields = ['license_id', 'employee', 'type', 'start_date', 'end_date', 'days', 'status']

    def get_days(self, obj):
        return (obj.end_date - obj.start_date).days + 1

    def get_status(self, obj):
        if obj.justified:
            return 'Approved'
        elif obj.closing_date:
            return 'Rejected'
        else:
            return 'Pending'    


