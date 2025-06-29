from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt


from .models import User, Post, Following, Like


def index(request):
    return render(request, "network/index.html")


def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")


# My code for this project
@login_required
def create_post(request):
    """
    Create a new post for the current user
    """
    if request.method == "POST":
        content = request.POST.get("content", "").strip()
        if not content:
            return HttpResponse("Content cannot be empty", status=400)
        
        post = Post(author=request.user, content=content)
        post.save()

        return render(request, "network/index.html", {
            "message": "Post created successfully"
        })
   


@login_required
def get_posts(request):
    """ 
    Fetch all posts of current user in descending order 
    and return json response
    """
    posts = Post.objects.filter(author=request.user).order_by('-created_at')
    posts_data = []

    for post in posts:
        posts_data.append({
            "id": post.id,
            "content": post.content,
            "author": post.author.username,
            "created_at": post.created_at.strftime("%Y-%m-%d %H:%M:%S"),
            "updated_at": post.updated_at.strftime("%Y-%m-%d %H:%M:%S") if post.updated_at else None
        })
    return HttpResponse(posts_data, content_type="application/json")


    
