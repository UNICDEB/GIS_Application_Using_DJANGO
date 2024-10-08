from django.contrib import admin
from django.urls import path
from . import views

urlpatterns = [
    path("", views.index, name ='home'),
    path('about/', views.about, name="about_us"),
    path('contact/', views.contact, name="contact_us"),
    path('login/', views.login, name="login"),
    path('signup/', views.signup, name='signup'),
    path('route_map/', views.route_details, name='route_map'),
    path('arcmap/', views.arc_map_view, name='Arc Map'),
    path('contactus/', views.contact_us, name='contact_us'),
    path('goamap/', views.goamap, name='goamap'),
    ## route map
]
