from django.contrib import admin
from django.urls import path
from main import views

urlpatterns = [
    path("admin/", admin.site.urls),
    path("generate-sentence/", views.GenerateSentenceAPIView.as_view()),
    path("signup/", views.SignUpView.as_view()),
    path("login/", views.LoginView.as_view()),
    path("sessions/", views.SessionListView.as_view()),
    path("sessions/<int:id>/", views.MessageListView.as_view()),
]
