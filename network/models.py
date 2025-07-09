from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    following = models.ManyToManyField(
        'self',
        symmetrical=False,
        related_name='followers',
        blank=True
    )    

    # Query following: users that this user is following
    # user.following.all()

    # Query followers: users that follow this user
    # user.followers.all()
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
        self.save()

    def __str__(self):
        return str(self.content)[:20]

class Like(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='likes')
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='likes')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.username} liked {self.post.content[:20]}"
