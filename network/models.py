from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    username =models.CharField(max_length=150, unique=True)
    password = models.CharField(max_length=128)
    
    def __str__(self):
        return str(self.username)

class Post(models.Model):
    content = models.TextField()
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posts')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(blank=True, null=True)

    def save(self, *args, **kwargs):
        if not self.content:
            raise ValueError("Content cannot be empty")
        super().save(*args, **kwargs)
    
    def update(self, new_content):
        if not new_content:
            raise ValueError("New content cannot be empty")
        self.content = new_content
        self.updated_at = models.DateField(auto_now_add=True)
        self.save()

    def __str__(self):
        return str(self.content)[:20]

class Following(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='followers')
    follower = models.ForeignKey(User, on_delete=models.CASCADE, related_name='following')

    created_at = models.DateTimeField(auto_now_add=True)

    def get_followers(self):
        return self.follower.followers.all()

    def __str__(self):
        return f"{self.user.username} is followed by {self.follower.username}"

class Like(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='likes')
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='liked')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} liked {self.post.content[:20]}"
