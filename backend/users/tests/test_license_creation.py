import json
from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from django.contrib.auth import get_user_model
from users.models import HealthFirstUser, Role, Department

class HealthFirstUserTests(TestCase):

    def setUp(self):
        self.role = Role.objects.create(name='Admin')
        self.department = Department.objects.create(name='IT')
        
        self.username = 'testuser'
        self.email = 'testuser@example.com'
        self.password = 'testpassword'
        self.first_name = 'Test'
        self.last_name = 'User'
        self.phone = '1234567890'
        self.dni = 12345678
        self.date_of_birth = '1990-01-01'
        self.employment_start_date = '2020-01-01'

        self.user = HealthFirstUser.objects.create_user(
            username=self.username,
            first_name=self.first_name,
            last_name=self.last_name,
            email=self.email,
            password=self.password,
            phone=self.phone,
            dni=self.dni,
            date_of_birth=self.date_of_birth,
            employment_start_date=self.employment_start_date,
            role=self.role,
            department=self.department
        )
        self.client.login(username=self.username, password=self.password)

    def test_create_user_successfully(self):
        url = reverse('register_user')
        data = {
            "username": "user",
            "password": "test",
            "first_name": "John",
            "last_name": "Doe",
            "email": "johndoe@example.com",
            "phone": "9876543210",
            "dni": 87654321,
            "role_name": "employee",
            "department": "tecnologia",
            "date_of_birth": "1985-05-05",
            "employment_start_date": "2015-05-05"
    }

        response = self.client.post(url, data=json.dumps(data), content_type='application/json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('ok', response.json())
        self.assertTrue(response.json().get('ok'))


    def test_get_user_success(self):
        url = reverse('get_user', args=[self.user.id])
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()['user']['dni'], self.dni)
        self.assertEqual(response.json()['user']['email'], self.email)

    def test_delete_user_successfully(self):
        url = reverse('delete_user', args=[self.user.id])
        response = self.client.delete(url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertTrue(self.user.is_deleted)
        self.assertIsNotNone(self.user.delete_at)

    def test_create_user_with_missing_fields(self):
        url = reverse('register_user')
        data = {
            'first_name': 'MissingLastName',
            'email': 'missinglast@example.com',
            'phone': '0000000000',
            # faltan 'last_name', 'dni', 'role', 'department'
        }
        response = self.client.post(url, data=json.dumps(data), content_type='application/json')

        errors = response.json().get('errors', [])
        self.assertGreater(len(errors), 0)

    def test_soft_delete_user(self):
        self.user.delete()
        self.assertTrue(self.user.is_deleted)
        self.assertIsNotNone(self.user.delete_at)

    def test_retrieve_deleted_user(self):
        self.user.delete() 
        url = reverse('get_user', args=[self.user.id]) 
        response = self.client.get(url)

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND) 
