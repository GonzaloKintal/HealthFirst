from lib2to3.pytree import Base
from rest_framework import serializers
from users.serializers import HealthFirstUserSerializer
from .models import License, LicenseType, Status

class LicenseSerializer(serializers.ModelSerializer):
    employee = serializers.CharField(source='user.get_full_name')
    days = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()
    user = HealthFirstUserSerializer(read_only=True)
    type=serializers.SlugRelatedField(read_only=True, slug_field='name')
    evaluator=serializers.SerializerMethodField()
    evaluator_role=serializers.SerializerMethodField()

    class Meta:
        model = License
        fields = ['user', 'license_id', 'user_id', 'employee', 'type', 'start_date', 'end_date', 'days', 'status', 'information','evaluator','evaluator_role']

    def get_days(self, obj):
        return (obj.end_date - obj.start_date).days + 1

    def get_status(self, obj):
        return obj.status.name
    
    def get_evaluator(self, obj):
        return (obj.evaluator.first_name + ' ' + obj.evaluator.last_name) if obj.evaluator else ""
    
    def get_evaluator_role(self, obj):
        return obj.evaluator.role.name if obj.evaluator else ""


class LicenseSerializerCSV(LicenseSerializer):
    username = serializers.SlugRelatedField(source='user', read_only=True, slug_field='username')
    user_name = serializers.SerializerMethodField()
    status = serializers.SerializerMethodField()
    

    def get_user_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}"

    def get_status(self, obj):
        return obj.status.get_name_display()

    class Meta:
        model = License
        fields = ['license_id','username', 'user_name', 'type', 'start_date', 'end_date', 'days', 'status', 'information','evaluator','evaluator_role']  # Add new fields

class LicenseTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = LicenseType
        fields = ['id', 'name', 'description', 'min_advance_notice_days', 'certificate_require', 'tolerance_days_certificate_submission', 'total_days_granted', 'max_consecutive_days', 'yearly_approved_requests']
