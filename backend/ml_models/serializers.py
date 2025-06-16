from rest_framework import serializers
from ml_models.models import *

class MLModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = MLModel
        fields = '__all__'