# Create your views here.
from django.shortcuts import render, HttpResponse
# create a function
def index(request):
    context = {
        'variable': 'this is sent'
    }
    return render(request, 'index.html', context)

def about(request):
    return HttpResponse("This is about Us page")

def contact(request):
    return HttpResponse("This is contact Us page")

def login(request):
    
    return render(request, 'login.html')

def signup(request):
    return render(request, 'signup.html')

def map_view(request):
    return render(request, 'map.html')

def arc_map_view(request):
    return render(request, 'arc_map.html')

def contact_us(request):
    return render(request, 'contact_us.html')