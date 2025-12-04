from django.test import TestCase
from django.urls import reverse
from .models import Todo
from datetime import date


class TodoModelTest(TestCase):
	def test_create_todo(self):
		t = Todo.objects.create(title='Test', due_date=date.today())
		self.assertFalse(t.completed)
		self.assertEqual(str(t), 'Test')


class TodoViewsTest(TestCase):
	def test_add_toggle_delete(self):
		resp = self.client.post(reverse('todo:add'), {'title': 'Buy milk', 'description': '', 'due_date': '', 'completed': False})
		self.assertEqual(resp.status_code, 302)
		todo = Todo.objects.get(title='Buy milk')
		toggle_url = reverse('todo:toggle', args=[todo.pk])
		resp = self.client.post(toggle_url)
		self.assertRedirects(resp, reverse('todo:home'))
		todo.refresh_from_db()
		self.assertTrue(todo.completed)
		resp = self.client.post(reverse('todo:delete', args=[todo.pk]))
		self.assertRedirects(resp, reverse('todo:home'))
		self.assertFalse(Todo.objects.filter(pk=todo.pk).exists())
