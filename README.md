# 🌍 GIS Application Using Django

A web-based **Geographic Information System (GIS)** application developed using **Django**.  
This project demonstrates how to build a GIS-enabled web platform with dynamic pages, static assets, and database integration.

---

## 🚀 Features

- 🗺️ Web-based GIS application using Django framework
- 📍 Interactive geographic data visualization
- 📂 Modular Django app structure
- 🎨 HTML templates and static assets support
- 🗄️ SQLite database integration
- ⚡ Lightweight and fast deployment for local testing

---

## 🧰 Technology Stack

- **Backend:** Python, Django  
- **Frontend:** HTML, CSS, JavaScript  
- **Database:** SQLite  
- **Web Server:** Django Development Server  

---

## 📂 Project Structure

```
GIS_Application_Using_DJANGO/
├── gis_app/               # Main GIS application logic
├── gis_application/       # Django project settings
├── static/                # CSS, JS, images
├── templates/             # HTML templates
├── db.sqlite3             # SQLite database
├── manage.py              # Django management script
├── requirements.txt       # Project dependencies
└── README.md              # Project documentation
```

---

## 🛠️ Installation & Setup

### ✅ Step 1: Clone Repository

```bash
git clone https://github.com/UNICDEB/GIS_Application_Using_DJANGO.git
cd GIS_Application_Using_DJANGO
```

---

### ✅ Step 2: Create Virtual Environment (Recommended)

```bash
python -m venv venv
```

Activate:

**Windows**
```bash
venv\Scripts\activate
```

**Linux / Mac**
```bash
source venv/bin/activate
```

---

### ✅ Step 3: Install Dependencies

```bash
pip install -r requirements.txt
```

---

### ✅ Step 4: Run Database Migrations

```bash
python manage.py migrate
```

---

### ✅ Step 5: Start Development Server

```bash
python manage.py runserver
```

Open your browser and visit:

```
http://127.0.0.1:8000/
```

---

## 🗄️ Database

- Default database: **SQLite**
- File: `db.sqlite3`
- Automatically managed by Django ORM

---

## 🎨 Static & Templates

- Static files:
  ```
  static/
  ```
- HTML templates:
  ```
  templates/
  ```

---

## 📌 Usage

- Launch the application using Django server.
- Navigate through the GIS interface.
- View and interact with map-based data.
- Extend functionality by adding new Django views, models, or GIS layers.

---

## 🧪 Development Notes

- Suitable for learning GIS integration with Django.
- Easily extendable to PostGIS or GeoDjango.
- Can be deployed on cloud or local servers.

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository  
2. Create a new branch  
3. Commit your changes  
4. Push to your fork  
5. Submit a Pull Request  

---

## 📄 License

This project is open-source and free to use for educational and research purposes.

---

## 👨‍💻 Author

Developed by **Debabrata Doloi**  
GitHub: UNICDEB  

