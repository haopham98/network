
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),

    # My code for this project
    path("posts/", views.all_posts, name="all_posts"),
    path("posts/<int:post_id>", views.post_detail, name="post_detail"),
    path("profile/<str:username>", views.profile_page, name="profile_page"),
    path("user/<str:username>", views.user_profile, name="user_profile"),
    path("create_post", views.create_post, name="create_post"),
    path("like/<int:post_id>", views.like_post, name="like_post"),
    path("follow/<str:username>", views.follow_toggle, name="follow_toggle"),
    path("edit_post/<int:post_id>", views.edit_post, name="edit_post")
]
