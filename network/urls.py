
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),

    # My code for this project
    path("create_post", views.create_post, name="create_post"),
    path("get_posts", views.get_posts, name="get_posts")
]
