# Create your views here.
from django.shortcuts import render, HttpResponse

from django.shortcuts import render
from django.http import HttpResponse
import folium
import openrouteservice as ors

# Function to display the initial map with or without route
def route_details(request):
    default_start = [15.52538679334307, 73.98775739769982]
    m = folium.Map(location=default_start, tiles="openstreetmap", zoom_start=13)

    if request.method == 'POST':
        start_lat = float(request.POST.get('start_lat'))
        start_lon = float(request.POST.get('start_lon'))
        end_lat = float(request.POST.get('end_lat'))
        end_lon = float(request.POST.get('end_lon'))

        client = ors.Client(key='5b3ce3597851110001cf62489314a86a4f614d78be8c545828c98c15')
        start_coords = [start_lon, start_lat]
        end_coords = [end_lon, end_lat]
        coords = [start_coords, end_coords]
        route = client.directions(coordinates=coords, profile='driving-car', format='geojson', preference='fastest', units='km')
        route_coords = [list(reversed(coord)) for coord in route['features'][0]['geometry']['coordinates']]
        folium.PolyLine(locations=route_coords, color="blue").add_to(m)
      
        start_location = client.pelias_reverse(point=start_coords)
        end_location = client.pelias_reverse(point=end_coords)
        start_area_name = start_location['features'][0]['properties'].get('label', 'Unknown Area')
        end_area_name = end_location['features'][0]['properties'].get('label', 'Unknown Area')

        folium.Marker(location=[start_lat, start_lon], popup=f"<b>Start: {start_area_name}</b>", icon=folium.Icon(color='green', icon='home', prefix='fa')).add_to(m)
        folium.Marker(location=[end_lat, end_lon], popup=f"<b>End: {end_area_name}</b>", icon=folium.Icon(color='blue', prefix="fa", icon="tent")).add_to(m)
        m.fit_bounds([route_coords[0], route_coords[-1]])


    map_html = m._repr_html_()
    return render(request, 'map.html', {'map': map_html})





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

# def map_view(request):
#     return render(request, 'map.html')

def arc_map_view(request):
    return render(request, 'arc_map.html')

def contact_us(request):
    return render(request, 'contact_us.html')

def goamap(request):
    return render(request, 'goamap.html')