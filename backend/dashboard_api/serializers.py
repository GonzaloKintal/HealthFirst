from rest_framework import serializers
from .models import HealthFirstUser


class HealthFirstUserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    role = serializers.SlugRelatedField(read_only=True, slug_field='name')

    class Meta:
        model = HealthFirstUser
        fields = ['id', 'full_name', 'role','email']

    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}"