# VALUE RIDE - Smarter Way to Choose Your Ride

A comprehensive web application for browsing and analyzing used car data with **real Apache Spark integration**, advanced filtering, visualizations, and download capabilities.

## 🚀 **NEW: Real Spark Web UI Integration**

This application now connects to a **real Apache Spark cluster** running on `localhost:4040` with full backend API integration!

### **Spark Features:**
- **Real Spark DataFrame processing** for car data
- **Live Spark Web UI** at `http://localhost:4040`
- **Backend API** for Spark job management
- **Real-time job tracking** and metrics
- **Direct connection** to Spark cluster status

## Features

### 🚗 **Home Page (About Us)**
- Modern hero section with engaging animations
- About us information
- Feature showcase with glassmorphism cards
- Contact information with click-to-email and click-to-call

### 🔍 **Car Browsing & Filtering**
- **Responsive car grid** with detailed information
- **Advanced filtering system** with:
  - Text search with partial matching
  - Fuel type and transmission filters
  - Price range with preset buckets and custom ranges
  - Year range with approximate search (±2 years)
  - KM driven range with flexible matching
  - **Approximate search toggle** for flexible filtering
- **Real Spark processing** when enabled
- **Real-time filtering** with instant results
- **Pagination** for large datasets
- **Grid/List view toggle**

### 🔥 **Real Spark Integration**
- **Live Spark cluster connection** to `localhost:4040`
- **Backend Spark API** for data processing
- **Real DataFrame operations** using PySpark
- **Job tracking** with actual Spark job history
- **Spark Web UI integration** - opens real UI in new tab
- **Performance metrics** from actual Spark cluster
- **Schema validation** and data transformation
- **Caching strategies** for optimal performance

### 📊 **Data Visualizations**
- **Price Distribution** histogram
- **Fuel Type Distribution** pie chart
- **Year vs Price Trend** scatter plot
- All charts are **interactive** with tooltips
- **Responsive** to applied filters
- **Download individual charts** as PNG/PDF

### 📄 **Download & Export Features**
- **Export filtered dataset** as branded CSV
- **Individual car details** as PDF
- **All visualizations** as combined PDF
- **Spark processing reports** with job metrics
- **VALUE RIDE branding** on all exports

### 🎨 **Modern UI/UX**
- **Teal/blue gradient theme** with modern aesthetics
- **Glassmorphism design** with backdrop blur effects
- **Smooth animations** and hover effects
- **Fully responsive** for mobile, tablet, and desktop
- **Loading states** and transitions

## Technology Stack

- **Backend**: Apache Spark (PySpark), Flask API
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Data Processing**: Spark DataFrames, Spark SQL
- **API**: Flask with CORS support
- **Charts**: Chart.js for interactive visualizations
- **PDF Generation**: jsPDF for report creation
- **Icons**: Font Awesome
- **Fonts**: Inter (Google Fonts)

## Prerequisites

### **Required Software:**
1. **Python 3.7+** - [Download Python](https://python.org)
2. **Java 8 or 11** - [Download Java](https://adoptium.net/) (Required for Spark)
3. **pip** (usually comes with Python)

### **Optional:**
- **VS Code** with Live Server extension
- **Modern web browser** (Chrome, Firefox, Safari, Edge)

## Setup Instructions

### **🚀 Quick Start (Full Spark Integration)**

1. **Clone/Download** this repository
2. **Install Dependencies:**
   ```bash
   pip install -r requirements.txt
   ```
3. **Run Setup Script:**
   ```bash
   setup.bat  # Windows
   # Choose option 1 for full setup
   ```

This will start:
- **Spark Backend API** on `http://localhost:5000`
- **Spark Web UI** on `http://localhost:4040`
- **VALUE RIDE Website** on `http://localhost:8000`

### **📋 Manual Setup**

#### **Step 1: Install Python Dependencies**
```bash
pip install pyspark flask flask-cors pandas
```

#### **Step 2: Start Spark Backend**
```bash
python spark_app.py
```
This starts:
- Spark cluster with Web UI on port 4040
- Flask API server on port 5000
- Automatic CSV data loading

#### **Step 3: Start Website Server**
```bash
python -m http.server 8000
```

#### **Step 4: Open Website**
Navigate to: `http://localhost:8000`

### **🌐 Alternative Setup Options**

#### **Option A: VS Code Live Server**
1. Open the folder in VS Code
2. Install Live Server extension
3. Right-click `index.html` → "Open with Live Server"

#### **Option B: Website Only (No Spark)**
```bash
python -m http.server 8000
```
Website will work in simulation mode without real Spark backend.

## File Structure

```
shri/
├── index.html              # Main HTML file with both pages
├── styles.css              # Complete CSS with modern styling
├── app.js                  # JavaScript with Spark integration
├── spark_app.py            # Spark backend with Flask API
├── requirements.txt        # Python dependencies
├── setup.bat              # Windows setup script
├── used_car_dataset_cleaned.csv  # Car dataset
└── README.md               # This file
```

## 🔥 **Spark Integration Details**

### **Backend API Endpoints:**
- `GET /api/spark/status` - Get Spark cluster status
- `POST /api/cars/load` - Load data into Spark DataFrame
- `POST /api/cars/filter` - Apply filters using Spark
- `GET /api/spark/jobs` - Get real job history
- `GET /api/spark/metrics` - Get cluster metrics

### **Spark Processing Features:**
- **DataFrame Operations**: Real PySpark DataFrame processing
- **Schema Validation**: Structured data types for performance
- **Query Optimization**: Spark SQL Catalyst optimizer
- **Caching**: Intelligent DataFrame caching
- **Partitioning**: Automatic data partitioning
- **Memory Management**: Configurable executor memory

### **Real Spark Web UI:**
- Access the actual Spark Web UI at `http://localhost:4040`
- View real job execution details
- Monitor cluster performance
- See actual stage and task information
- Real-time executor metrics

## Key Functionalities

### 🔥 **Spark Integration Usage:**
1. Start the backend: `python spark_app.py`
2. Go to "Available Cars" page
3. Enable "🔥 Spark Integration" toggle
4. Click "Open Spark Web UI" to see both:
   - **Integrated UI**: Custom VALUE RIDE interface
   - **Real Spark Web UI**: Official Spark dashboard
5. Apply filters to trigger real Spark jobs
6. Monitor job execution in real-time

### 🔍 **Smart Filtering with Spark:**
- **Real DataFrame Filtering**: Using Spark SQL operations
- **Approximate Search**: Tolerance-based range filtering
- **Performance Optimization**: Cached results for speed
- **Schema Enforcement**: Proper data types for efficiency

### 📊 **Visualization with Live Data:**
- Charts reflect real Spark-processed data
- Data aggregation using Spark DataFrame operations
- Real-time updates from Spark backend

### 💾 **Enhanced Export Capabilities:**
- **Spark Job Reports**: Download actual job execution details
- **Performance Metrics**: Real cluster performance data
- **Processing Statistics**: Actual execution times and data sizes

## Usage Instructions

### **Starting the Application:**
1. **Run `setup.bat`** and choose option 1
2. **Wait for all services** to start (about 10-15 seconds)
3. **Open your browser** to `http://localhost:8000`
4. **Check Spark Web UI** at `http://localhost:4040`

### **Using Spark Features:**
1. **Navigate to "Available Cars"**
2. **Enable Spark Integration** toggle
3. **Apply filters** to trigger real Spark jobs
4. **Click "Open Spark Web UI"** to see:
   - VALUE RIDE integrated interface
   - Real Apache Spark Web UI (opens in new tab)
5. **Monitor job execution** in real-time

### **Troubleshooting Spark:**
- **Java not found**: Install Java 8 or 11
- **Port 4040 in use**: Change port in `spark_app.py`
- **Connection failed**: Check if backend is running
- **Simulation mode**: Backend not available, using mock data

## Performance Features

- **Spark DataFrame Caching** for repeated queries
- **Lazy Evaluation** - operations only execute when needed
- **Query Optimization** via Spark SQL Catalyst
- **Adaptive Query Execution** for dynamic optimization
- **Partition Coalescing** to reduce small files

## Browser Compatibility

- **Chrome**: Fully supported (recommended for Spark UI)
- **Firefox**: Fully supported
- **Safari**: Fully supported
- **Edge**: Fully supported
- **Mobile browsers**: Responsive design for all features

## Configuration

### **Spark Configuration:**
Edit `spark_app.py` to modify Spark settings:
```python
spark = SparkSession.builder \
    .config("spark.executor.memory", "2g") \
    .config("spark.ui.port", "4040") \
    # ... other configurations
```

### **API Configuration:**
- **API Port**: Change Flask port in `spark_app.py`
- **CORS Settings**: Modify CORS configuration for security
- **Endpoints**: Add custom API endpoints as needed

## Monitoring & Debugging

### **Spark Web UI Sections:**
- **Jobs**: View completed and running jobs
- **Stages**: See task execution details  
- **Storage**: Monitor DataFrame caching
- **Environment**: Check Spark configuration
- **Executors**: Monitor resource usage

### **Logging:**
- **Spark Logs**: Check console output from `spark_app.py`
- **API Logs**: Flask request/response logging
- **Browser Console**: JavaScript debugging information

## Support

For technical support or questions:
- **Email**: shrinithivijayakumar11@gmail.com
- **Phone**: 7010366061

## License

This project is created for educational/demonstration purposes.

---

**VALUE RIDE** - Your trusted platform for choosing the perfect used car with **real Apache Spark processing** and data-driven insights!

## Features

### 🚗 **Home Page (About Us)**
- Modern hero section with engaging animations
- About us information
- Feature showcase with glassmorphism cards
- Contact information with click-to-email and click-to-call

### 🔍 **Car Browsing & Filtering**
- **Responsive car grid** with detailed information
- **Advanced filtering system** with:
  - Text search with partial matching
  - Fuel type and transmission filters
  - Price range with preset buckets and custom ranges
  - Year range with approximate search (±2 years)
  - KM driven range with flexible matching
  - **Approximate search toggle** for flexible filtering
- **Real-time filtering** with instant results
- **Pagination** for large datasets
- **Grid/List view toggle**

### 📊 **Data Visualizations**
- **Price Distribution** histogram
- **Fuel Type Distribution** pie chart
- **Year vs Price Trend** scatter plot
- All charts are **interactive** with tooltips
- **Responsive** to applied filters
- **Download individual charts** as PNG/PDF

### 📄 **Download & Export Features**
- **Export filtered dataset** as branded CSV
- **Individual car details** as PDF
- **All visualizations** as combined PDF
- **VALUE RIDE branding** on all exports

### 🎨 **Modern UI/UX**
- **Teal/blue gradient theme** with modern aesthetics
- **Glassmorphism design** with backdrop blur effects
- **Smooth animations** and hover effects
- **Fully responsive** for mobile, tablet, and desktop
- **Loading states** and transitions

### 📱 **Mobile-First Design**
- Responsive navigation with hamburger menu
- Touch-friendly interface
- Optimized for all screen sizes

## Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Styling**: CSS Custom Properties, Flexbox, Grid
- **Charts**: Chart.js for interactive visualizations
- **PDF Generation**: jsPDF for report creation
- **Icons**: Font Awesome
- **Fonts**: Inter (Google Fonts)

## Setup Instructions

### Option 1: Static Files (Recommended)

1. **Clone or download** this repository
2. **Open VS Code** and navigate to the project folder
3. **Install Live Server extension** if not already installed:
   - Go to Extensions (Ctrl+Shift+X)
   - Search for "Live Server"
   - Install by Ritwick Dey
4. **Right-click on `index.html`** and select "Open with Live Server"
5. **The website will open** automatically in your default browser

### Option 2: Simple HTTP Server

1. **Open terminal** in the project directory
2. **Python 3**:
   ```bash
   python -m http.server 8000
   ```
3. **Node.js** (if you have http-server installed):
   ```bash
   npx http-server
   ```
4. **Open browser** and navigate to `http://localhost:8000`

### Option 3: VS Code Live Preview

1. **Install Live Preview extension** in VS Code
2. **Open `index.html`** in VS Code
3. **Press Ctrl+Shift+P** and type "Live Preview: Start Server"
4. **Select the command** and the preview will open

## File Structure

```
shri/
├── index.html              # Main HTML file with both pages
├── styles.css              # Complete CSS with modern styling
├── app.js                  # JavaScript with all functionality
├── used_car_dataset_cleaned.csv  # Car dataset
└── README.md               # This file
```

## Key Functionalities

### 🔍 **Smart Filtering**
- **Approximate Search**: When enabled, expands search ranges automatically
  - Price: ±10% tolerance
  - Year: ±2 years tolerance  
  - KM: ±10% tolerance
- **Preset Filters**: Quick buttons for common ranges
- **Real-time Updates**: Charts and results update instantly

### 📊 **Dynamic Visualizations**
- Charts automatically reflect filtered data
- Interactive tooltips with detailed information
- Download capabilities with VALUE RIDE branding
- Responsive design that works on all devices

### 💾 **Export Capabilities**
- **CSV Exports**: Include VALUE RIDE header and generation timestamp
- **PDF Reports**: Professional formatting with brand identity
- **Chart Downloads**: High-quality PNG exports
- **Combined Reports**: All visualizations in one PDF

### 🎯 **Data Processing**
- Automatic CSV parsing with error handling
- Price and kilometer normalization
- Flexible data format support
- Robust error handling for missing data

## Usage Instructions

### Navigation
1. **Home Page**: Learn about VALUE RIDE and its features
2. **Available Cars**: Browse and filter the car database
3. **Contact Us**: Direct email and phone contact options

### Filtering Cars
1. **Search**: Type any part of a car name
2. **Enable Approximate Search**: For flexible matching
3. **Use Preset Buttons**: Quick filter common ranges
4. **Custom Ranges**: Enter specific min/max values
5. **Multiple Filters**: Combine different filter types

### Viewing Car Details
1. **Click "View Details"** on any car card
2. **See complete specifications** in the modal
3. **Download individual car PDF/CSV**
4. **Contact seller** via email or phone

### Downloading Data
1. **Filtered Cars CSV**: Export current search results
2. **Individual Charts**: Download specific visualizations
3. **All Charts PDF**: Combined visualization report
4. **Car Details**: Individual car information as PDF/CSV

## Dataset Information

The application uses `used_car_dataset_cleaned.csv` with the following fields:
- Brand, Model, Year, Age
- KM Driven, Transmission, Owner
- Fuel Type, Posted Date
- Ask Price, Additional Info

## Browser Compatibility

- **Chrome**: Fully supported
- **Firefox**: Fully supported
- **Safari**: Fully supported
- **Edge**: Fully supported
- **Mobile browsers**: Optimized for all major mobile browsers

## Performance Features

- **Lazy loading** of visualizations
- **Efficient filtering** with client-side processing
- **Pagination** for large datasets
- **Optimized rendering** for smooth performance

## Customization

### Color Theme
Edit CSS custom properties in `:root` to change the color scheme:
```css
:root {
    --primary-color: #14b8a6;    /* Teal */
    --secondary-color: #0ea5e9;   /* Blue */
    /* ... other variables */
}
```

### Charts
Modify chart configurations in `app.js` to customize:
- Chart types and styles
- Color schemes
- Animation settings
- Tooltip formats

### Branding
Update branding elements:
- Company name in navigation and downloads
- Contact information
- Logo and visual elements

## Troubleshooting

### Common Issues

1. **CSV not loading**:
   - Ensure the CSV file is in the same directory
   - Check browser console for network errors
   - Use a local server (not file:// protocol)

2. **Charts not displaying**:
   - Verify Chart.js is loaded
   - Check browser console for JavaScript errors
   - Ensure canvas elements exist

3. **Downloads not working**:
   - Check if jsPDF library is loaded
   - Verify browser allows downloads
   - Ensure data is available before download

4. **Filters not working**:
   - Check JavaScript console for errors
   - Verify filter input elements exist
   - Ensure data is loaded before filtering

## Support

For technical support or questions:
- **Email**: shrinithivijayakumar11@gmail.com
- **Phone**: 7010366061

## License

This project is created for educational/demonstration purposes.

---

**VALUE RIDE** - Your trusted platform for choosing the perfect used car based on data-driven insights.
