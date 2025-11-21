from django.urls import reverse_lazy, reverse
from django.views.generic import ListView, CreateView, UpdateView, DeleteView
from django.shortcuts import redirect, get_object_or_404
from django.http import HttpResponseForbidden

from .models import Todo
from .forms import TodoForm


class TodoListView(ListView):
    model = Todo
    template_name = "todo/home.html"
    context_object_name = "todos"
    ordering = ["due_date", "pk"]


class TodoCreateView(CreateView):
    model = Todo
    form_class = TodoForm
    template_name = "todo/form.html"
    success_url = reverse_lazy("todo:home")


class TodoUpdateView(UpdateView):
    model = Todo
    form_class = TodoForm
    template_name = "todo/form.html"
    success_url = reverse_lazy("todo:home")


class TodoDeleteView(DeleteView):
    model = Todo
    template_name = "todo/confirm_delete.html"
    success_url = reverse_lazy("todo:home")


def toggle_completed(request, pk):
    if request.method != "POST":
        return HttpResponseForbidden()
    todo = get_object_or_404(Todo, pk=pk)
    todo.completed = not todo.completed
    todo.save()
    return redirect(reverse("todo:home"))
from django.shortcuts import render

# Create your views here.
