from django.contrib import admin
from .models import Todo


@admin.register(Todo)
class TodoAdmin(admin.ModelAdmin):
	list_display = ("title", "completed", "due_date")
	list_filter = ("completed", "due_date")
	search_fields = ("title", "description")