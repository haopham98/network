from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
import json
from django.core.paginator import Paginator
from django.utils import timezone
from django.views.decorators.http import require_http_methods


from .models import User, Post, Like


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

def index(request):
    """
    Render the index page for the network app
    """
    return render(request, "network/index.html", {
        "username": request.user.username if request.user.is_authenticated else None,
        "title": "Network",
    })

def profile(request, username):
    """
    Render the profile page for the current user
    """
    if request.user.is_authenticated:
        user = User.objects.get(username=username)
        if user != request.user:
            return HttpResponse("Unauthorized", status=401)
        
        return render(request, "network/profile.html", {
            "title": "Profile",
            "username": user.username,
            "email": user.email
        })
    else:
        return HttpResponseRedirect(reverse("login"))

def all_posts(request):
    """
    Render the index page for the netork app
    """
    if request.method == "GET":
        allposts = Post.objects.all().order_by("-created_at")
        page_number = request.GET.get("page", 1)
        paginator = Paginator(allposts, 10)
        try:
            posts = paginator.page(page_number)
        except Exception as e:
            return JsonResponse({"error": "Invalid page number"}, status=400)
        
        posts_data = []
        for post in posts:
            like_count = Like.objects.filter(post=post).count()
            liked_by_user = Like.objects.filter(post=post, user=request.user).exists() if request.user.is_authenticated else False
            posts_data.append({
                "id": post.id,
                "content": post.content,
                "author": post.author.username,
                "created_at": post.created_at.strftime("%Y-%m-%d %H:%M:%S"),
                "like_count": like_count,
                "liked_by_user": liked_by_user,
                "updated_at": post.updated_at.strftime("%Y-%m-%d %H:%M-%S") if post.updated_at else None
            })

        return JsonResponse({
            "posts": posts_data,
            "is_authenticated": request.user.is_authenticated,
            "page": {
                "number": posts.number,
                "total_pages": paginator.num_pages
            }
        })
    return JsonResponse({"error": "Method not allowed"}, status=405)

@login_required
def create_post(request):
    """
    Create a new post for the current user
    """
    if request.method == "POST":
        data = request.POST if request.POST else json.loads(request.body)
        content = data.get("content", "").strip()
        if not content:
            return JsonResponse({"error": "Content cannot be empty"}, status=400)
                
        # Create the post
        post = Post.objects.create(
            author=request.user,
            content=content
        )
        post.save()

        return JsonResponse({"message": "Post created successfully", "post_id": post.id}, status=201)
    if not request.csrf_processing:
        return HttpResponse("CSRF token missing or incorrect", status=403)

    return JsonResponse({"error": "Method not allowed"}, status=405)
   
    
@login_required
def like_post(request, post_id):
    """
    Like a post by the current user
    """

    if not request.user.is_authenticated:
        return JsonResponse({
            "error": "Login required to like posts."
           # "redirect": reverse("login")
        }, status=401)


    if request.method == "POST":
        try:
            post = Post.objects.get(id=post_id)
            
        except Post.DoesNotExist:
            return JsonResponse({"error": "Post not found"}, status=404)
    
        # Check if the user has already liked the post
        like, created = Like.objects.get_or_create(user=request.user, post=post)
        
        if not created:
            # If the like already exists, remove it
            like.delete()
            like_count = Like.objects.filter(post=post).count()
            return JsonResponse({
                "liked_by_user": False,
                "post_id": post_id,
                "like_count": like_count
                }, status=200)
        else:
            # If the like was created, return success message
            like_count = Like.objects.filter(post=post).count()
            return JsonResponse({
                "liked_by_user": True,
                "post_id": post_id,
                "like_count": like_count
            }, status=201)
    return JsonResponse(
        {
            "error": "Method not allowed",
            "status": 405
         }, 
        status=405)
    

def post_detail(request, post_id):
    """
    Get post detail by post id
    """

    if request.method == "GET":
        try:
            post = Post.objects.get(id=post_id)
        except Post.DoesNotExist:
            return JsonResponse({"error": "Post not found"}, status=404)
        
        like_count = Like.objects.filter(post=post).count()
        liked_by_user = Like.objects.filter(post=post, user=request.user).exists() if request.user.is_authenticated else False

        post_data = {
            "id": post.id,
            "content": post.content,
            "author": post.author.username,
            "created_at": post.created_at.strftime("%Y-%m-%d %H:%M:%S"),
            "like_count": like_count,
            "liked_by_user": liked_by_user,
            "updated_at": post.updated_at.strftime("%Y-%m-%d %H:%M:%S") if post.updated_at else None
        }
        return JsonResponse(post_data, status=200)
    return JsonResponse({"error": "Method not allowed"}, status=405)

def profile_page(request, username):
    """
    Render the profile page for the current user
    """
    if request.method == "GET":

        if not request.user.is_authenticated:
            return HttpResponseRedirect(reverse("login"))
        
        try:
            profile_user = User.objects.get(username=username)
        except User.DoesNotExist:
            return JsonResponse({"error": "User not found"}, status=404)
        context = {
            "username": profile_user.username,
        }
        return render(request, "network/profile.html", context)

@login_required
def user_profile(request, username):
    """
    Get page number of posts by the user
    Get user profile information including posts, following count, and followers count, isFollowing
    """

    if request.user.is_authenticated:
        if request.method == "GET":
            try:
                user = User.objects.get(username=username)
            except User.DoesNotExist:
                return JsonResponse({"error": "User not found"}, status=404)
    
            following_count = user.following.count()
            follwers_count = user.followers.count()

            is_following = user.followers.filter(id=request.user.id).exists() if request.user.is_authenticated else False

            # get posts by the user
            allposts = Post.objects.filter(author=user).order_by("-created_at")
            page_number = request.GET.get("page", 1)
            paginator = Paginator(allposts, 10)
            try:
                posts = paginator.page(page_number)
            except Exception as e:
                return JsonResponse({ "error": "Invalid page number" }, status=400)

            posts_data = []
            for post in posts:
                like_count = Like.objects.filter(post=post).count()
                posts_data.append({
                    "id": post.id,
                    "content": post.content,
                    "author": post.author.username,
                    "created_at": post.created_at.strftime("%Y-%m-%d %H:%M:%S"),
                    "like_count": like_count,
                    "updated_at": post.updated_at.strftime("%Y-%m-%d %H:%M:%S") if post.updated_at else None
                })

            return JsonResponse({
                "username": user.username,
                "current_user": request.user.username if request.user.is_authenticated else None,
                "name": user.get_full_name(),
                "email": user.email,
                "following_count": following_count,
                "followers_count": follwers_count,
                "is_following": is_following,
                "posts": posts_data,
                "page": {
                    "number": posts.number,
                    "total_pages": paginator.num_pages
                }
            })
        return JsonResponse({"error": "Method not allowed" }, status=405)
    else:
        return HttpResponseRedirect(reverse("login"))


@login_required
def follow_toggle(request, username):
    """
    Folllow/Unfollow a user
    return a message notifying the user of the action taken
    amd status of the follow action
    1. If the user is already following, unfollow the user
    2. If the user is not following, follow the user
    """
    if request.method == "PUT":
        try: 
            user_to_follow = User.objects.get(username=username)
            current_user = User.objects.get(username=request.user.username)
        except User.DoesNotExist:
            return JsonResponse({"error": "User not found"}, status=404)
        
        if user_to_follow == request.user:
            return JsonResponse({"error": "You cannot follow yourself"}, status=400)
        
        # Check if the user is already following the user_to_follow
        if request.user.following.filter(id=user_to_follow.id).exists():
            user_to_follow.followers.remove(request.user)
            current_user.following.remove(user_to_follow)
            following_count = user_to_follow.followers.count()
            follower_count = user_to_follow.following.count()

            return JsonResponse({
                "status": HttpResponse.status_code,
                "message": f"You have unfollowd {user_to_follow.username}",
                "is_following": False,
                "following_count": following_count,
                "follower_count": follower_count
            })
        else:
            user_to_follow.following.add(current_user)
            current_user.following.add(user_to_follow)
            following_count = user_to_follow.followers.count()
            follower_count = user_to_follow.following.count()
            return JsonResponse({
                "status" : HttpResponse.status_code,
                "message": f"You are now following {user_to_follow.username}",
                "is_following": True,
                "following_count": following_count,
                "follower_count": follower_count
            })
    return JsonResponse({"error": "Method not allowed"}, status=405)

           
def get_following(request):
    """
    Get the list of users that the current user is following
    """
    if request.method == "GET":
        if not request.user.is_authenticated:
            return JsonResponse({"error": "User not authenticated"}, status=401)
        
        following_users = request.user.following.all()
        following_data = [{"username": user.username} for user in following_users]
        number_of_following = following_users.count()
        
        return JsonResponse({
            "following": following_data,
            "number_of_following": number_of_following
        }, status=200)
    
    return JsonResponse({"error": "Method not allowed"}, status=405)

def get_followers(request):
    """
    Get the list of users that are following the current user
    """
    if request.method == "GET":
        if not request.user.is_authenticated:
            return JsonResponse({"error": "User not authenticated"}, status=401)
        
        follower_users = request.user.followers.all()
        follower_data = [{"username": user.username} for user in follower_users]
        number_of_followers = follower_users.count()

        return JsonResponse({
            "followers": follower_data,
            "number_of_followers": number_of_followers
        }, status=200)
    return JsonResponse({"error": "Method not allowed"}, status=405)

@login_required
@require_http_methods(["PUT"])
def edit_post(request, post_id):
    """
    Update a post by the current user
    """
    if request.method == "PUT":
        try:
            post = Post.objects.get(id=post_id, author=request.user)
        except Post.DoesNotExist:
            return JsonResponse({"error": "Post not found"}, status=404)
        
        data = json.loads(request.body)
        new_content = data.get("content", "").strip()
        if not new_content:
            return JsonResponse({"error": "Content cannot be empty"}, status=400)
        post.content = new_content
        post.updated_at = timezone.now()
        post.save()
        return JsonResponse({
            "message": "Post updated successfully",
            "post_id": post.id
            }, status=200)
    return JsonResponse({"error": "Method not allowed"}, status=405)

@login_required
def following(request):
    """
    Render the following page for the current user
    """
    if request.method == "GET":
        return render(request, "network/following.html", {
            "username": request.user.username,
            "title": "Following"
        })
    return JsonResponse({"error": "Method not allowed"}, status=405)


@login_required
def following_posts(request):
    """
    Get post from users that the current user is following 
    except the current user
    """

    if request.method == "GET":
        following_users = request.user.following.all()
        following_posts = Post.objects.filter(author__in=following_users).order_by("-created_at")
        page_number = request.GET.get("page", 1)
        paginator = Paginator(following_posts, 10)
        try:
            posts = paginator.page(page_number)
        except Exception as e:
            return JsonResponse({"error": "Invalid page number"}, status=400)

        posts_data = []

        for post in posts:
            like_count = Like.objects.filter(post=post).count()
            like_by_user = Like.objects.filter(post=post, user=request.user).exists()
            posts_data.append({
                "id": post.id,
                "content": post.content,
                "author": post.author.username,
                "created_at": post.created_at.strftime("%Y-%m-%d %H:%M:%S"),
                "like_count": like_count,
                "liked_by_user": like_by_user,
                "updated_at": post.updated_at.strftime("%Y-%m-%d %H:%M:%S") if post.updated_at else None
            })
        
        return JsonResponse({
            "status": HttpResponse.status_code,
            "posts": posts_data,
            "page": {
                "number": posts.number,
                "total_pages": paginator.num_pages
            }
        })

