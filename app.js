// === GLOBAL VARIABLES ===
let allCars = [];
let filteredCars = [];
let currentPage = 1;
let carsPerPage = 12;
let currentView = 'grid';
let currentCarData = null;
let charts = {};

// === INITIALIZATION ===
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

async function initializeApp() {
    try {
        await loadCSVData();
        setupEventListeners();
        hideLoading();
        showPage('home');
    } catch (error) {
        console.error('Error initializing app:', error);
        hideLoading();
    }
}

// === CSV DATA LOADING ===
async function loadCSVData() {
    try {
        const response = await fetch('used_car_dataset_cleaned.csv');
        const csvText = await response.text();
        allCars = parseCSV(csvText);
        filteredCars = [...allCars];
        console.log(`Loaded ${allCars.length} cars`);
    } catch (error) {
        console.error('Error loading CSV:', error);
        // Fallback to empty array
        allCars = [];
        filteredCars = [];
    }
}

function parseCSV(csvText) {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',');
    const cars = [];

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        if (!line.trim()) continue;

        const values = parseCSVLine(line);
        if (values.length === headers.length) {
            const car = {};
            headers.forEach((header, index) => {
                car[header.trim()] = values[index] ? values[index].trim() : '';
            });
            
            // Clean and normalize data
            car.id = i;
            car.normalizedPrice = parsePrice(car.AskPrice);
            car.normalizedKM = parseKilometers(car.kmDriven);
            car.Year = parseInt(car.Year) || 0;
            car.displayName = `${car.Brand} ${car.model}`.trim();
            
            cars.push(car);
        }
    }
    
    return cars;
}

function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    
    result.push(current);
    return result;
}

function parsePrice(priceStr) {
    if (!priceStr) return 0;
    // Remove currency symbols, commas, and convert to number
    const cleaned = priceStr.replace(/[₹,\s]/g, '');
    return parseInt(cleaned) || 0;
}

function parseKilometers(kmStr) {
    if (!kmStr) return 0;
    // Handle both "98,000 km" and "190000.0 km" formats
    const cleaned = kmStr.toString().replace(/[,\s]/g, '').replace(/km.*$/i, '');
    return parseInt(parseFloat(cleaned)) || 0;
}

// === PAGE NAVIGATION ===
function showPage(pageId) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    
    // Show selected page
    const targetPage = document.getElementById(pageId + '-page');
    if (targetPage) {
        targetPage.classList.add('active');
        
        if (pageId === 'cars') {
            updateResultsDisplay();
            generateCharts();
        }
    }
}

function hideLoading() {
    const loading = document.getElementById('loading');
    if (loading) {
        loading.classList.add('hidden');
        setTimeout(() => loading.style.display = 'none', 500);
    }
}

// === EVENT LISTENERS ===
function setupEventListeners() {
    // Navigation
    setupNavigationEvents();
    
    // Modal events
    setupModalEvents();
    
    // Spark UI integration
    setupSparkIntegration();
    
    // Filter events are set up inline in HTML for simplicity
}

function setupNavigationEvents() {
    document.addEventListener('click', (e) => {
        if (e.target.matches('.nav-link')) {
            e.preventDefault();
            
            // Handle navigation
            const href = e.target.getAttribute('href');
            if (href === '#contact') {
                // Scroll to contact section smoothly
                const contactSection = document.getElementById('contact');
                if (contactSection) {
                    // Ensure we're on the home page first
                    showPage('home');
                    setTimeout(() => {
                        contactSection.scrollIntoView({ 
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }, 300);
                }
            }
        }
    });
}

function setupModalEvents() {
    // Close modal when clicking outside
    document.getElementById('car-modal').addEventListener('click', (e) => {
        if (e.target.id === 'car-modal') {
            closeModal();
        }
    });
    
    // Close modal on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
            // Also close Spark UI if open
            const sparkModal = document.getElementById('spark-ui-modal');
            if (sparkModal) sparkModal.remove();
        }
    });
}
let sparkUIEnabled = false;
let sparkJobHistory = [];
let sparkAPIBase = 'http://localhost:5000/api';
let sparkWebUIUrl = 'http://localhost:4040';

async function setupSparkIntegration() {
    // Initialize Spark UI components
    createSparkUIControls();
    
    // Check Spark connection on page load
    await checkSparkConnection();
    
    // Load job history from backend
    await loadSparkJobHistory();
}

async function checkSparkConnection() {
    try {
        const response = await fetch(`${sparkAPIBase}/spark/status`);
        const data = await response.json();
        
        if (data.status === 'connected') {
            sparkWebUIUrl = data.webui_url || 'http://localhost:4040';
            showSparkNotification('✅ Connected to Spark cluster', 'success');
            updateSparkStatus(true, data);
        } else {
            showSparkNotification('⚠️ Spark cluster not available. Using simulation mode.', 'warning');
            updateSparkStatus(false);
        }
    } catch (error) {
        console.log('Spark API not available, using simulation mode');
        updateSparkStatus(false);
    }
}

function updateSparkStatus(connected, sparkInfo = null) {
    const statusText = document.getElementById('spark-status-text');
    const indicator = document.querySelector('.status-indicator');
    
    if (statusText && indicator) {
        if (connected && sparkInfo) {
            statusText.textContent = `Spark: ${sparkInfo.app_name} (${sparkInfo.app_id.substring(0, 8)}...)`;
            indicator.style.backgroundColor = '#10b981';
        } else {
            statusText.textContent = 'Spark Context: Simulation Mode';
            indicator.style.backgroundColor = '#f59e0b';
        }
    }
}

async function loadSparkJobHistory() {
    try {
        const response = await fetch(`${sparkAPIBase}/spark/jobs`);
        const data = await response.json();
        sparkJobHistory = data.jobs || [];
        return sparkJobHistory;
    } catch (error) {
        console.log('Using simulated job history');
        return initializeSparkJobTracking();
    }
}

function createSparkUIControls() {
    // Add Spark UI toggle to filter panel
    const filterPanel = document.querySelector('.filter-panel');
    if (filterPanel) {
        const sparkSection = document.createElement('div');
        sparkSection.className = 'filter-group spark-integration';
        sparkSection.innerHTML = `
            <label>🔥 Spark Integration</label>
            <label class="toggle-label">
                <input type="checkbox" id="spark-ui-toggle" onchange="toggleSparkUI()">
                <span class="toggle-slider"></span>
                <span>Enable Spark Processing</span>
            </label>
            <small>Simulate Apache Spark for big data processing</small>
            <div id="spark-controls" class="spark-controls" style="display: none;">
                <button class="download-btn spark-btn" onclick="viewSparkUI()">
                    <i class="fas fa-fire"></i> Open Spark Web UI
                </button>
                <button class="download-btn spark-btn" onclick="showSparkJobHistory()">
                    <i class="fas fa-history"></i> Job History
                </button>
                <div id="spark-status" class="spark-status">
                    <span class="status-indicator"></span>
                    <span id="spark-status-text">Spark Context: Disconnected</span>
                </div>
            </div>
        `;
        
        // Insert before download section
        const downloadSection = filterPanel.querySelector('.download-section');
        if (downloadSection) {
            filterPanel.insertBefore(sparkSection, downloadSection);
        } else {
            filterPanel.appendChild(sparkSection);
        }
    }
}

function toggleSparkUI() {
    const toggle = document.getElementById('spark-ui-toggle');
    const controls = document.getElementById('spark-controls');
    const statusText = document.getElementById('spark-status-text');
    
    sparkUIEnabled = toggle.checked;
    
    if (sparkUIEnabled) {
        controls.style.display = 'block';
        statusText.textContent = 'Spark Context: Connected (Simulated)';
        controls.querySelector('.status-indicator').style.backgroundColor = '#10b981';
        
        // Simulate Spark context initialization
        showSparkNotification('Spark Context initialized successfully', 'success');
        
        // Start processing job simulation
        simulateSparkJob('Data Loading', 2000);
    } else {
        controls.style.display = 'none';
        statusText.textContent = 'Spark Context: Disconnected';
        controls.querySelector('.status-indicator').style.backgroundColor = '#ef4444';
        
        showSparkNotification('Spark Context disconnected', 'info');
    }
}

function initializeSparkJobTracking() {
    // Initialize with some sample job history
    sparkJobHistory = [
        {
            id: 1,
            name: 'CSV Data Loading',
            status: 'SUCCEEDED',
            duration: '2.1s',
            timestamp: new Date(Date.now() - 300000).toLocaleString(),
            stages: 3,
            tasks: 12
        },
        {
            id: 2,
            name: 'Data Filtering Transform',
            status: 'SUCCEEDED',
            duration: '0.8s',
            timestamp: new Date(Date.now() - 120000).toLocaleString(),
            stages: 2,
            tasks: 8
        }
    ];
}

function simulateSparkJob(jobName, duration) {
    if (!sparkUIEnabled) return;
    
    const jobId = sparkJobHistory.length + 1;
    const startTime = Date.now();
    
    // Create job entry
    const job = {
        id: jobId,
        name: jobName,
        status: 'RUNNING',
        duration: 'Running...',
        timestamp: new Date().toLocaleString(),
        stages: Math.floor(Math.random() * 5) + 1,
        tasks: Math.floor(Math.random() * 20) + 5
    };
    
    sparkJobHistory.unshift(job);
    
    showSparkNotification(`Starting Spark Job: ${jobName}`, 'info');
    
    setTimeout(() => {
        job.status = 'SUCCEEDED';
        job.duration = `${((Date.now() - startTime) / 1000).toFixed(1)}s`;
        
        showSparkNotification(`Job completed: ${jobName}`, 'success');
        updateSparkMetrics();
    }, duration);
}

function viewSparkUI() {
    if (!sparkUIEnabled) {
        showSparkNotification('Please enable Spark Integration first', 'warning');
        return;
    }
    
    // Try to open real Spark Web UI first
    window.open(sparkWebUIUrl, '_blank');
    
    // Also show our integrated UI
    createSparkUIModal();
}

async function createSparkUIModal() {
    // Remove existing modal if any
    const existingModal = document.getElementById('spark-ui-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Get real metrics from Spark backend
    let metrics = {
        active_jobs: 0,
        succeeded_jobs: sparkJobHistory.filter(j => j.status === 'SUCCEEDED').length,
        total_jobs: sparkJobHistory.length,
        data_processed: filteredCars.length
    };
    
    try {
        const response = await fetch(`${sparkAPIBase}/spark/metrics`);
        const data = await response.json();
        metrics = data;
    } catch (error) {
        console.log('Using local metrics');
    }
    
    const modal = document.createElement('div');
    modal.id = 'spark-ui-modal';
    modal.className = 'modal active';
    modal.innerHTML = `
        <div class="modal-content spark-ui-content">
            <div class="modal-header">
                <h2><i class="fas fa-fire"></i> Spark Web UI - VALUE RIDE</h2>
                <div class="spark-header-actions">
                    <button class="action-btn" onclick="window.open('${sparkWebUIUrl}', '_blank')">
                        <i class="fas fa-external-link-alt"></i> Open Real Spark UI
                    </button>
                    <button class="close-modal" onclick="closeSparkUI()">&times;</button>
                </div>
            </div>
            <div class="modal-body spark-ui-body">
                <div class="spark-tabs">
                    <button class="spark-tab active" onclick="showSparkTab('jobs')">Jobs</button>
                    <button class="spark-tab" onclick="showSparkTab('stages')">Stages</button>
                    <button class="spark-tab" onclick="showSparkTab('storage')">Storage</button>
                    <button class="spark-tab" onclick="showSparkTab('environment')">Environment</button>
                </div>
                
                <div id="spark-jobs-content" class="spark-tab-content active">
                    <div class="spark-metrics">
                        <div class="metric-card">
                            <h4>Active Jobs</h4>
                            <span class="metric-value">${metrics.active_jobs}</span>
                        </div>
                        <div class="metric-card">
                            <h4>Completed Jobs</h4>
                            <span class="metric-value">${metrics.succeeded_jobs}</span>
                        </div>
                        <div class="metric-card">
                            <h4>Total Jobs</h4>
                            <span class="metric-value">${metrics.total_jobs}</span>
                        </div>
                        <div class="metric-card">
                            <h4>Data Processed</h4>
                            <span class="metric-value">${metrics.data_processed} records</span>
                        </div>
                    </div>
                    
                    <div class="spark-job-list">
                        <h3>Job History (Real-time from Spark Backend)</h3>
                        <table class="spark-table">
                            <thead>
                                <tr>
                                    <th>Job ID</th>
                                    <th>Description</th>
                                    <th>Status</th>
                                    <th>Duration</th>
                                    <th>Details</th>
                                    <th>Timestamp</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${sparkJobHistory.map(job => `
                                    <tr>
                                        <td>${job.id}</td>
                                        <td>${job.name}</td>
                                        <td><span class="status-badge ${job.status.toLowerCase()}">${job.status}</span></td>
                                        <td>${job.duration || 'N/A'}</td>
                                        <td>${job.details || 'N/A'}</td>
                                        <td>${job.timestamp}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <div id="spark-stages-content" class="spark-tab-content">
                    <h3>Stage Information</h3>
                    <div class="spark-info">
                        <p>🔄 Data transformation stages for current dataset</p>
                        <ul>
                            <li><strong>Stage 0:</strong> CSV File Reading - Read ${allCars.length} records via Spark DataFrame</li>
                            <li><strong>Stage 1:</strong> Data Schema Application - Apply structured schema and data types</li>
                            <li><strong>Stage 2:</strong> Data Cleaning & Transformation - Normalize price and KM fields</li>
                            <li><strong>Stage 3:</strong> Filter Application - Apply user filters using Spark SQL</li>
                            <li><strong>Stage 4:</strong> Result Caching - Cache filtered results for performance</li>
                            <li><strong>Stage 5:</strong> Result Aggregation - Prepare ${filteredCars.length} filtered results</li>
                        </ul>
                    </div>
                </div>
                
                <div id="spark-storage-content" class="spark-tab-content">
                    <h3>RDD Storage & DataFrames</h3>
                    <div class="storage-info">
                        <div class="storage-item">
                            <strong>Cars Dataset DataFrame</strong>
                            <p>Size: ${(JSON.stringify(allCars).length / 1024).toFixed(2)} KB</p>
                            <p>Partitions: 4 (auto-partitioned)</p>
                            <p>Storage Level: MEMORY_AND_DISK_SER</p>
                            <p>Cached: Yes (for performance optimization)</p>
                        </div>
                        <div class="storage-item">
                            <strong>Filtered Results DataFrame</strong>
                            <p>Size: ${(JSON.stringify(filteredCars).length / 1024).toFixed(2)} KB</p>
                            <p>Partitions: 2 (coalesced after filtering)</p>
                            <p>Storage Level: MEMORY_ONLY</p>
                            <p>Cached: Yes (active query result)</p>
                        </div>
                        <div class="storage-item">
                            <strong>Spark SQL Catalyst Optimizer</strong>
                            <p>Query Optimization: Enabled</p>
                            <p>Adaptive Query Execution: Enabled</p>
                            <p>Partition Coalescing: Enabled</p>
                            <p>Predicate Pushdown: Active</p>
                        </div>
                    </div>
                </div>
                
                <div id="spark-environment-content" class="spark-tab-content">
                    <h3>Spark Configuration</h3>
                    <table class="spark-table">
                        <thead>
                            <tr><th>Property</th><th>Value</th></tr>
                        </thead>
                        <tbody>
                            <tr><td>spark.app.name</td><td>VALUE_RIDE_DataProcessor</td></tr>
                            <tr><td>spark.master</td><td>local[*]</td></tr>
                            <tr><td>spark.ui.enabled</td><td>true</td></tr>
                            <tr><td>spark.ui.port</td><td>4040</td></tr>
                            <tr><td>spark.executor.memory</td><td>2g</td></tr>
                            <tr><td>spark.driver.memory</td><td>1g</td></tr>
                            <tr><td>spark.sql.adaptive.enabled</td><td>true</td></tr>
                            <tr><td>spark.sql.adaptive.coalescePartitions.enabled</td><td>true</td></tr>
                            <tr><td>spark.serializer</td><td>org.apache.spark.serializer.KryoSerializer</td></tr>
                            <tr><td>spark.ui.showConsoleProgress</td><td>true</td></tr>
                            <tr><td>spark.sql.execution.arrow.pyspark.enabled</td><td>true</td></tr>
                        </tbody>
                    </table>
                </div>
                
                <div class="spark-actions">
                    <button class="action-btn" onclick="refreshSparkData()">
                        <i class="fas fa-sync"></i> Refresh Data
                    </button>
                    <button class="action-btn" onclick="downloadSparkReport()">
                        <i class="fas fa-download"></i> Download Report
                    </button>
                    <button class="action-btn" onclick="triggerManualJob()">
                        <i class="fas fa-play"></i> Run Manual Job
                    </button>
                    <button class="action-btn" onclick="window.open('${sparkWebUIUrl}', '_blank')">
                        <i class="fas fa-external-link-alt"></i> Open Spark Web UI
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function showSparkTab(tabName) {
    // Remove active class from all tabs and contents
    document.querySelectorAll('.spark-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.spark-tab-content').forEach(content => content.classList.remove('active'));
    
    // Add active class to selected tab and content
    event.target.classList.add('active');
    document.getElementById(`spark-${tabName}-content`).classList.add('active');
}

function closeSparkUI() {
    const modal = document.getElementById('spark-ui-modal');
    if (modal) {
        modal.remove();
    }
}

function showSparkJobHistory() {
    if (!sparkUIEnabled) {
        showSparkNotification('Please enable Spark Integration first', 'warning');
        return;
    }
    
    const historyModal = document.createElement('div');
    historyModal.className = 'modal active';
    historyModal.innerHTML = `
        <div class="modal-content">
            <div class="modal-header">
                <h2><i class="fas fa-history"></i> Spark Job History</h2>
                <button class="close-modal" onclick="this.closest('.modal').remove()">&times;</button>
            </div>
            <div class="modal-body">
                <div class="job-history-list">
                    ${sparkJobHistory.map(job => `
                        <div class="job-item">
                            <div class="job-header">
                                <strong>Job ${job.id}: ${job.name}</strong>
                                <span class="status-badge ${job.status.toLowerCase()}">${job.status}</span>
                            </div>
                            <div class="job-details">
                                <span>Duration: ${job.duration}</span>
                                <span>Stages: ${job.stages}</span>
                                <span>Tasks: ${job.tasks}</span>
                                <span>Time: ${job.timestamp}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(historyModal);
}

async function triggerManualJob() {
    try {
        showSparkNotification('🚀 Starting manual Spark job...', 'info');
        
        // Try to load fresh data from backend
        const response = await fetch(`${sparkAPIBase}/cars/load`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });
        
        const data = await response.json();
        
        if (data.success) {
            showSparkNotification(`✅ Manual job completed: ${data.message}`, 'success');
            await loadSparkJobHistory(); // Refresh job history
            
            // Refresh the modal if it's open
            const modal = document.getElementById('spark-ui-modal');
            if (modal) {
                createSparkUIModal();
            }
        } else {
            showSparkNotification('⚠️ Manual job failed, using simulation', 'warning');
            simulateSparkJob('Manual Data Refresh', 1500);
        }
    } catch (error) {
        console.log('Spark API not available, using simulation');
        simulateSparkJob('Manual Data Refresh', 1500);
    }
}

function refreshSparkData() {
    simulateSparkJob('Data Refresh', 1000);
    setTimeout(() => {
        applyFilters();
        generateCharts();
    }, 1000);
}

function downloadSparkReport() {
    if (typeof jsPDF === 'undefined') {
        alert('PDF library not loaded. Please try again.');
        return;
    }

    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();

    // Header
    pdf.setFontSize(20);
    pdf.setTextColor(20, 184, 166);
    pdf.text('VALUE RIDE', 20, 20);
    
    pdf.setFontSize(16);
    pdf.setTextColor(0, 0, 0);
    pdf.text('Spark Processing Report', 20, 35);
    pdf.setFontSize(12);
    pdf.text(`Generated on: ${new Date().toLocaleString()}`, 20, 45);

    let yPos = 60;

    // Job Summary
    pdf.setFontSize(14);
    pdf.text('Job Summary', 20, yPos);
    yPos += 10;

    pdf.setFontSize(10);
    pdf.text(`Total Jobs Executed: ${sparkJobHistory.length}`, 20, yPos);
    yPos += 6;
    pdf.text(`Successful Jobs: ${sparkJobHistory.filter(j => j.status === 'SUCCEEDED').length}`, 20, yPos);
    yPos += 6;
    pdf.text(`Total Records Processed: ${allCars.length}`, 20, yPos);
    yPos += 6;
    pdf.text(`Filtered Results: ${filteredCars.length}`, 20, yPos);
    yPos += 15;

    // Job History
    pdf.setFontSize(14);
    pdf.text('Recent Job History', 20, yPos);
    yPos += 10;

    sparkJobHistory.slice(0, 10).forEach(job => {
        pdf.setFontSize(10);
        pdf.text(`Job ${job.id}: ${job.name}`, 20, yPos);
        pdf.text(`Status: ${job.status}`, 120, yPos);
        pdf.text(`Duration: ${job.duration}`, 160, yPos);
        yPos += 6;
    });

    pdf.save('VALUE_RIDE_Spark_Report.pdf');
}

function updateSparkMetrics() {
    // Update metrics in Spark UI if open
    const metricsCards = document.querySelectorAll('.metric-value');
    if (metricsCards.length >= 4) {
        metricsCards[1].textContent = sparkJobHistory.filter(j => j.status === 'SUCCEEDED').length;
        metricsCards[2].textContent = sparkJobHistory.length;
        metricsCards[3].textContent = `${filteredCars.length} records`;
    }
}

function showSparkNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `spark-notification ${type}`;
    notification.innerHTML = `
        <i class="fas fa-fire"></i>
        <span>${message}</span>
    `;
    
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: var(--gradient-surface);
        backdrop-filter: blur(10px);
        border: 1px solid var(--border);
        border-radius: 8px;
        padding: 1rem;
        box-shadow: var(--shadow-lg);
        z-index: 2001;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        max-width: 300px;
        animation: slideInRight 0.3s ease-out;
    `;
    
    if (type === 'success') notification.style.borderLeft = '4px solid #10b981';
    else if (type === 'warning') notification.style.borderLeft = '4px solid #f59e0b';
    else if (type === 'error') notification.style.borderLeft = '4px solid #ef4444';
    else notification.style.borderLeft = '4px solid var(--primary-color)';
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-out forwards';
        setTimeout(() => notification.remove(), 300);
    }, 4000);
}

// === FILTERING LOGIC ===
function applyFilters() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const fuelType = document.getElementById('fuel-filter').value;
    const transmission = document.getElementById('transmission-filter').value;
    const priceMin = parseInt(document.getElementById('price-min').value) || 0;
    const priceMax = parseInt(document.getElementById('price-max').value) || Infinity;
    const yearMin = parseInt(document.getElementById('year-min').value) || 0;
    const yearMax = parseInt(document.getElementById('year-max').value) || Infinity;
    const kmMin = parseInt(document.getElementById('km-min').value) || 0;
    const kmMax = parseInt(document.getElementById('km-max').value) || Infinity;
    const approximateSearch = document.getElementById('approximate-search').checked;

    filteredCars = allCars.filter(car => {
        // Search filter
        if (searchTerm) {
            const carName = car.displayName.toLowerCase();
            if (!carName.includes(searchTerm)) return false;
        }

        // Fuel type filter
        if (fuelType && car.FuelType !== fuelType) return false;

        // Transmission filter
        if (transmission && car.Transmission !== transmission) return false;

        // Price filter
        let price = car.normalizedPrice;
        if (approximateSearch) {
            const priceRange = price * 0.1; // 10% tolerance
            if (priceMin > 0 && price < priceMin - priceRange) return false;
            if (priceMax < Infinity && price > priceMax + priceRange) return false;
        } else {
            if (price < priceMin || price > priceMax) return false;
        }

        // Year filter
        let year = car.Year;
        if (approximateSearch) {
            if (yearMin > 0 && year < yearMin - 2) return false;
            if (yearMax < Infinity && year > yearMax + 2) return false;
        } else {
            if (year < yearMin || year > yearMax) return false;
        }

        // KM filter
        let km = car.normalizedKM;
        if (approximateSearch) {
            const kmRange = km * 0.1; // 10% tolerance
            if (kmMin > 0 && km < kmMin - kmRange) return false;
            if (kmMax < Infinity && km > kmMax + kmRange) return false;
        } else {
            if (km < kmMin || km > kmMax) return false;
        }

        return true;
    });

    currentPage = 1;
    updateResultsDisplay();
    generateCharts();
    
    // Trigger Spark job if enabled
    if (sparkUIEnabled) {
        triggerSparkFiltering();
    }
}

async function triggerSparkFiltering() {
    try {
        const filters = {
            search: document.getElementById('search-input').value,
            fuelType: document.getElementById('fuel-filter').value,
            transmission: document.getElementById('transmission-filter').value,
            priceMin: parseInt(document.getElementById('price-min').value) || null,
            priceMax: parseInt(document.getElementById('price-max').value) || null,
            yearMin: parseInt(document.getElementById('year-min').value) || null,
            yearMax: parseInt(document.getElementById('year-max').value) || null,
            kmMin: parseInt(document.getElementById('km-min').value) || null,
            kmMax: parseInt(document.getElementById('km-max').value) || null,
            approximate: document.getElementById('approximate-search').checked
        };
        
        const response = await fetch(`${sparkAPIBase}/cars/filter`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(filters)
        });
        
        const data = await response.json();
        
        if (data.success) {
            showSparkNotification(`✅ Spark processing complete: ${data.count} cars found`, 'success');
            await loadSparkJobHistory(); // Refresh job history
        } else {
            showSparkNotification('⚠️ Spark processing failed, using local data', 'warning');
            simulateSparkJob('Data Filtering Transform', 800);
        }
    } catch (error) {
        console.log('Spark API not available, using simulation');
        simulateSparkJob('Data Filtering Transform', 800);
    }
}

function clearAllFilters() {
    document.getElementById('search-input').value = '';
    document.getElementById('fuel-filter').value = '';
    document.getElementById('transmission-filter').value = '';
    document.getElementById('price-min').value = '';
    document.getElementById('price-max').value = '';
    document.getElementById('year-min').value = '';
    document.getElementById('year-max').value = '';
    document.getElementById('km-min').value = '';
    document.getElementById('km-max').value = '';
    document.getElementById('approximate-search').checked = false;
    
    // Clear active preset buttons
    document.querySelectorAll('.preset-btn.active').forEach(btn => {
        btn.classList.remove('active');
    });
    
    filteredCars = [...allCars];
    currentPage = 1;
    updateResultsDisplay();
    generateCharts();
}

// === PRESET FILTER FUNCTIONS ===
function setPriceRange(min, max) {
    document.getElementById('price-min').value = min > 0 ? min : '';
    document.getElementById('price-max').value = max < 9999999 ? max : '';
    
    // Update button states
    updatePresetButtonStates(event.target);
    applyFilters();
}

function setYearRange(min, max) {
    document.getElementById('year-min').value = min;
    document.getElementById('year-max').value = max;
    
    // Update button states
    updatePresetButtonStates(event.target);
    applyFilters();
}

function setKMRange(min, max) {
    document.getElementById('km-min').value = min > 0 ? min : '';
    document.getElementById('km-max').value = max < 999999 ? max : '';
    
    // Update button states
    updatePresetButtonStates(event.target);
    applyFilters();
}

function updatePresetButtonStates(activeButton) {
    // Remove active class from sibling buttons
    activeButton.parentElement.querySelectorAll('.preset-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Add active class to clicked button
    activeButton.classList.add('active');
}

// === DISPLAY FUNCTIONS ===
function updateResultsDisplay() {
    const resultsCount = document.getElementById('results-count');
    const carsGrid = document.getElementById('cars-grid');
    
    if (!resultsCount || !carsGrid) return;

    resultsCount.textContent = `${filteredCars.length} cars found`;

    // Calculate pagination
    const totalPages = Math.ceil(filteredCars.length / carsPerPage);
    const startIndex = (currentPage - 1) * carsPerPage;
    const endIndex = startIndex + carsPerPage;
    const carsToShow = filteredCars.slice(startIndex, endIndex);

    // Clear grid
    carsGrid.innerHTML = '';

    if (carsToShow.length === 0) {
        carsGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: var(--text-secondary);">
                <i class="fas fa-car" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                <h3>No cars found</h3>
                <p>Try adjusting your filters to see more results.</p>
            </div>
        `;
        updatePagination(0, 0);
        return;
    }

    // Generate car cards
    carsToShow.forEach(car => {
        const carCard = createCarCard(car);
        carsGrid.appendChild(carCard);
    });

    updatePagination(totalPages, currentPage);
}

function createCarCard(car) {
    const card = document.createElement('div');
    card.className = 'car-card';
    
    const formattedPrice = formatPrice(car.normalizedPrice);
    const formattedKM = formatKilometers(car.normalizedKM);
    
    card.innerHTML = `
        <h3 class="car-title">${car.displayName}</h3>
        <div class="car-details-grid">
            <div class="car-detail">
                <span class="car-detail-label">Year</span>
                <span class="car-detail-value">${car.Year}</span>
            </div>
            <div class="car-detail">
                <span class="car-detail-label">KM Driven</span>
                <span class="car-detail-value">${formattedKM}</span>
            </div>
            <div class="car-detail">
                <span class="car-detail-label">Fuel Type</span>
                <span class="car-detail-value">${car.FuelType}</span>
            </div>
            <div class="car-detail">
                <span class="car-detail-label">Transmission</span>
                <span class="car-detail-value">${car.Transmission}</span>
            </div>
            <div class="car-detail">
                <span class="car-detail-label">Price</span>
                <span class="car-detail-value car-price">${formattedPrice}</span>
            </div>
        </div>
        <button class="view-details-btn" onclick="showCarDetails(${car.id})">
            View Details
        </button>
    `;
    
    return card;
}

function formatPrice(price) {
    if (price === 0) return 'Price not available';
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(1)} Cr`;
    if (price >= 100000) return `₹${(price / 100000).toFixed(1)} L`;
    if (price >= 1000) return `₹${(price / 1000).toFixed(0)} K`;
    return `₹${price}`;
}

function formatKilometers(km) {
    if (km === 0) return 'Not specified';
    if (km >= 100000) return `${(km / 100000).toFixed(1)} L km`;
    if (km >= 1000) return `${(km / 1000).toFixed(0)} K km`;
    return `${km} km`;
}

function updatePagination(totalPages, currentPageNum) {
    const pagination = document.getElementById('pagination');
    if (!pagination) return;

    pagination.innerHTML = '';

    if (totalPages <= 1) return;

    // Previous button
    const prevBtn = document.createElement('button');
    prevBtn.textContent = 'Previous';
    prevBtn.disabled = currentPageNum <= 1;
    prevBtn.onclick = () => {
        if (currentPage > 1) {
            currentPage--;
            updateResultsDisplay();
        }
    };
    pagination.appendChild(prevBtn);

    // Page numbers
    const startPage = Math.max(1, currentPageNum - 2);
    const endPage = Math.min(totalPages, startPage + 4);

    for (let i = startPage; i <= endPage; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.textContent = i;
        pageBtn.className = i === currentPageNum ? 'active' : '';
        pageBtn.onclick = () => {
            currentPage = i;
            updateResultsDisplay();
        };
        pagination.appendChild(pageBtn);
    }

    // Next button
    const nextBtn = document.createElement('button');
    nextBtn.textContent = 'Next';
    nextBtn.disabled = currentPageNum >= totalPages;
    nextBtn.onclick = () => {
        if (currentPage < totalPages) {
            currentPage++;
            updateResultsDisplay();
        }
    };
    pagination.appendChild(nextBtn);
}

// === VIEW TOGGLE ===
function setView(viewType) {
    currentView = viewType;
    
    // Update button states
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-view="${viewType}"]`).classList.add('active');
    
    // Update grid class
    const carsGrid = document.getElementById('cars-grid');
    carsGrid.className = viewType === 'list' ? 'cars-list' : 'cars-grid';
    
    updateResultsDisplay();
}

// === CAR DETAILS MODAL ===
function showCarDetails(carId) {
    const car = allCars.find(c => c.id === carId);
    if (!car) return;

    currentCarData = car;
    
    const modal = document.getElementById('car-modal');
    const modalTitle = document.getElementById('modal-title');
    const carDetails = document.getElementById('car-details');

    modalTitle.textContent = car.displayName;

    const details = [
        { label: 'Brand', value: car.Brand },
        { label: 'Model', value: car.model },
        { label: 'Year', value: car.Year },
        { label: 'Age', value: `${car.Age} years` },
        { label: 'KM Driven', value: formatKilometers(car.normalizedKM) },
        { label: 'Transmission', value: car.Transmission },
        { label: 'Owner', value: car.Owner },
        { label: 'Fuel Type', value: car.FuelType },
        { label: 'Posted Date', value: car.PostedDate },
        { label: 'Price', value: formatPrice(car.normalizedPrice) },
        { label: 'Additional Info', value: car.AdditionInfo || 'Not provided' }
    ];

    carDetails.innerHTML = details.map(detail => `
        <div class="detail-row">
            <span class="detail-label">${detail.label}</span>
            <span class="detail-value">${detail.value}</span>
        </div>
    `).join('');

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    const modal = document.getElementById('car-modal');
    modal.classList.remove('active');
    document.body.style.overflow = 'auto';
    currentCarData = null;
}

// === CHART GENERATION ===
function generateCharts() {
    // Destroy existing charts
    Object.values(charts).forEach(chart => {
        if (chart) chart.destroy();
    });
    charts = {};

    if (filteredCars.length === 0) return;

    generatePriceChart();
    generateFuelChart();
    generateYearPriceChart();
}

function generatePriceChart() {
    const ctx = document.getElementById('price-chart');
    if (!ctx) return;

    // Create price ranges
    const ranges = [
        { label: 'Under 2L', min: 0, max: 200000 },
        { label: '2L-5L', min: 200000, max: 500000 },
        { label: '5L-10L', min: 500000, max: 1000000 },
        { label: '10L-20L', min: 1000000, max: 2000000 },
        { label: '20L+', min: 2000000, max: Infinity }
    ];

    const data = ranges.map(range => {
        return filteredCars.filter(car => 
            car.normalizedPrice >= range.min && car.normalizedPrice < range.max
        ).length;
    });

    charts.priceChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ranges.map(r => r.label),
            datasets: [{
                label: 'Number of Cars',
                data: data,
                backgroundColor: '#14b8a6',
                borderColor: '#0f766e',
                borderWidth: 1,
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Price Distribution'
                },
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Number of Cars'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Price Range'
                    }
                }
            }
        }
    });
}

function generateFuelChart() {
    const ctx = document.getElementById('fuel-chart');
    if (!ctx) return;

    // Count fuel types
    const fuelCounts = {};
    filteredCars.forEach(car => {
        const fuel = car.FuelType || 'Unknown';
        fuelCounts[fuel] = (fuelCounts[fuel] || 0) + 1;
    });

    const labels = Object.keys(fuelCounts);
    const data = Object.values(fuelCounts);
    const colors = ['#14b8a6', '#0ea5e9', '#f59e0b', '#ef4444', '#8b5cf6'];

    charts.fuelChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: colors.slice(0, labels.length),
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Fuel Type Distribution'
                },
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

function generateYearPriceChart() {
    const ctx = document.getElementById('year-price-chart');
    if (!ctx) return;

    // Create scatter plot data
    const data = filteredCars.map(car => ({
        x: car.Year,
        y: car.normalizedPrice
    })).filter(point => point.x > 0 && point.y > 0);

    charts.yearPriceChart = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Cars',
                data: data,
                backgroundColor: '#14b8a6',
                borderColor: '#0f766e',
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Year vs Price Trend'
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Year'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Price (₹)'
                    },
                    ticks: {
                        callback: function(value) {
                            return formatPrice(value);
                        }
                    }
                }
            },
            interaction: {
                intersect: false
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Year: ${context.parsed.x}, Price: ${formatPrice(context.parsed.y)}`;
                        }
                    }
                }
            }
        }
    });
}

// === DOWNLOAD FUNCTIONS ===
function downloadChart(chartId, filename) {
    const canvas = document.getElementById(chartId);
    if (!canvas) return;

    // Create download link
    const link = document.createElement('a');
    link.download = `VALUE_RIDE_${filename}.png`;
    link.href = canvas.toDataURL();
    link.click();
}

function downloadAllVisualizations() {
    console.log('Download all visualizations triggered');
    
    if (typeof window.jspdf === 'undefined') {
        console.error('jsPDF not loaded, attempting to load...');
        
        // Try to load jsPDF dynamically
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/jspdf@latest/dist/jspdf.umd.min.js';
        script.onload = function() {
            console.log('jsPDF loaded dynamically');
            setTimeout(() => downloadAllVisualizations(), 500); // Retry after loading
        };
        script.onerror = function() {
            alert('Failed to load PDF library. Please reload the page and try again.');
        };
        document.head.appendChild(script);
        return;
    }

    if (filteredCars.length === 0) {
        alert('No data to visualize. Please go to "Available Cars" page and apply filters first.');
        return;
    }

    try {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF();

        // Add header
        pdf.setFontSize(20);
        pdf.setTextColor(20, 184, 166);
        pdf.text('VALUE RIDE', 20, 20);
        pdf.setFontSize(12);
        pdf.setTextColor(0, 0, 0);
        pdf.text('Data Visualizations Report', 20, 30);
        pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 40);
        pdf.text(`Total Cars: ${filteredCars.length}`, 20, 50);

        let yPosition = 70;

        // Add each chart
        const chartIds = ['price-chart', 'fuel-chart', 'year-price-chart'];
        const chartTitles = ['Price Distribution', 'Fuel Type Distribution', 'Year vs Price Trend'];

        let chartsAdded = 0;
        
        chartIds.forEach((chartId, index) => {
            const canvas = document.getElementById(chartId);
            if (canvas) {
                if (yPosition > 200) {
                    pdf.addPage();
                    yPosition = 20;
                }

                pdf.setFontSize(14);
                pdf.text(chartTitles[index], 20, yPosition);
                yPosition += 10;

                try {
                    const imgData = canvas.toDataURL('image/png');
                    pdf.addImage(imgData, 'PNG', 20, yPosition, 170, 85);
                    yPosition += 95;
                    chartsAdded++;
                } catch (chartError) {
                    console.error('Error processing chart:', chartId, chartError);
                    pdf.text(`Chart ${chartTitles[index]} could not be generated`, 20, yPosition);
                    yPosition += 15;
                }
            } else {
                console.warn('Chart not found:', chartId);
                pdf.text(`Chart ${chartTitles[index]} not available`, 20, yPosition);
                yPosition += 15;
            }
        });

        if (chartsAdded === 0) {
            alert('No charts available to download. Please go to "Available Cars" page to generate charts first.');
            return;
        }

        pdf.save('VALUE_RIDE_All_Charts.pdf');
        alert(`PDF downloaded with ${chartsAdded} charts!`);
        
    } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Error generating PDF. Please try again or check if you have charts visible on the page.');
    }
}

function downloadFilteredCSV() {
    console.log('Download CSV triggered');
    console.log('Filtered cars count:', filteredCars.length);
    
    if (filteredCars.length === 0) {
        alert('No cars to export. Please go to "Available Cars" page and apply filters first.');
        return;
    }

    try {
        // Create CSV content
        const headers = ['Brand', 'Model', 'Year', 'Age', 'KM_Driven', 'Transmission', 'Owner', 'Fuel_Type', 'Posted_Date', 'Ask_Price', 'Additional_Info'];
        
        let csvContent = '# VALUE RIDE - Filtered Car Data\n';
        csvContent += `# Generated on: ${new Date().toLocaleString()}\n`;
        csvContent += `# Total cars: ${filteredCars.length}\n`;
        csvContent += headers.join(',') + '\n';

        filteredCars.forEach(car => {
            const row = [
                car.Brand || '',
                car.model || '',
                car.Year || '',
                car.Age || '',
                car.kmDriven || '',
                car.Transmission || '',
                car.Owner || '',
                car.FuelType || '',
                car.PostedDate || '',
                car.AskPrice || '',
                `"${car.AdditionInfo || ''}"`
            ];
            csvContent += row.join(',') + '\n';
        });

        // Create and download file
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `VALUE_RIDE_Filtered_Cars_${new Date().toISOString().split('T')[0]}.csv`;
        
        // Add the link to DOM, click it, then remove it
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up the URL object
        URL.revokeObjectURL(link.href);
        
        alert('CSV file downloaded successfully!');
        
    } catch (error) {
        console.error('Error downloading CSV:', error);
        alert('Error downloading CSV file. Please try again.');
    }
}

function downloadCarPDF() {
    console.log('Download PDF triggered for car:', currentCarData);
    
    if (!currentCarData) {
        alert('No car data available. Please select a car first.');
        return;
    }

    // Check if jsPDF is available and load it if needed
    if (typeof window.jspdf === 'undefined') {
        console.error('jsPDF not loaded, attempting to load...');
        
        // Try to load jsPDF dynamically
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/jspdf@latest/dist/jspdf.umd.min.js';
        script.onload = function() {
            console.log('jsPDF loaded dynamically');
            setTimeout(() => downloadCarPDF(), 500); // Retry after loading
        };
        script.onerror = function() {
            alert('Failed to load PDF library. Please reload the page and try again.');
        };
        document.head.appendChild(script);
        return;
    }

    try {
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF();

        // Header
        pdf.setFontSize(20);
        pdf.setTextColor(20, 184, 166);
        pdf.text('VALUE RIDE', 20, 20);
        pdf.setFontSize(14);
        pdf.setTextColor(0, 0, 0);
        pdf.text('Car Details Report', 20, 35);

        // Car Info
        pdf.setFontSize(16);
        pdf.text(`${currentCarData.Brand} ${currentCarData.model}`, 20, 55);

        let yPosition = 75;
        const details = [
            ['Brand', currentCarData.Brand],
            ['Model', currentCarData.model],
            ['Year', currentCarData.Year],
            ['Age', currentCarData.Age],
            ['Kilometers Driven', currentCarData.kmDriven],
            ['Transmission', currentCarData.Transmission],
            ['Owner', currentCarData.Owner],
            ['Fuel Type', currentCarData.FuelType],
            ['Posted Date', currentCarData.PostedDate],
            ['Price', `₹${currentCarData.AskPrice}`]
        ];

        pdf.setFontSize(12);
        details.forEach(([label, value]) => {
            pdf.text(`${label}: ${value || 'N/A'}`, 20, yPosition);
            yPosition += 10;
        });

        // Additional Info
        if (currentCarData.AdditionInfo) {
            yPosition += 10;
            pdf.text('Additional Information:', 20, yPosition);
            yPosition += 10;
            const lines = pdf.splitTextToSize(currentCarData.AdditionInfo, 170);
            pdf.text(lines, 20, yPosition);
        }

        pdf.save(`VALUE_RIDE_${currentCarData.Brand}_${currentCarData.model}.pdf`);
        alert('PDF downloaded successfully!');

    } catch (error) {
        console.error('Error generating PDF:', error);
        alert('Error generating PDF. Please try again or reload the page.');
    }
}

    // Header
    pdf.setFontSize(20);
    pdf.setTextColor(20, 184, 166);
    pdf.text('VALUE RIDE', 20, 20);
    
    pdf.setFontSize(16);
    pdf.setTextColor(0, 0, 0);
    pdf.text('Car Details Report', 20, 35);

    // Car details
    let yPos = 55;
    pdf.setFontSize(18);
    pdf.text(currentCarData.displayName, 20, yPos);
    
    yPos += 15;
    pdf.setFontSize(12);

    const details = [
        ['Brand', currentCarData.Brand],
        ['Model', currentCarData.model],
        ['Year', currentCarData.Year.toString()],
        ['Age', `${currentCarData.Age} years`],
        ['KM Driven', formatKilometers(currentCarData.normalizedKM)],
        ['Transmission', currentCarData.Transmission],
        ['Owner', currentCarData.Owner],
        ['Fuel Type', currentCarData.FuelType],
        ['Posted Date', currentCarData.PostedDate],
        ['Price', formatPrice(currentCarData.normalizedPrice)]
    ];

    details.forEach(([label, value]) => {
        pdf.text(`${label}: ${value}`, 20, yPos);
        yPos += 8;
    });

    // Additional info
    if (currentCarData.AdditionInfo) {
        yPos += 5;
        pdf.text('Additional Information:', 20, yPos);
        yPos += 8;
        
        // Split long text
        const lines = pdf.splitTextToSize(currentCarData.AdditionInfo, 170);
        pdf.text(lines, 20, yPos);
        yPos += lines.length * 6;
    }

    // Contact info
    yPos += 15;
    pdf.setFontSize(14);
    pdf.text('Contact Information:', 20, yPos);
    yPos += 10;
function downloadCarCSV() {
    if (!currentCarData) {
        alert('No car data available.');
        return;
    }

    const headers = ['Brand', 'Model', 'Year', 'Age', 'KM_Driven', 'Transmission', 'Owner', 'Fuel_Type', 'Posted_Date', 'Ask_Price', 'Additional_Info'];
    
    let csvContent = '# VALUE RIDE - Car Details\n';
    csvContent += `# Generated on: ${new Date().toLocaleString()}\n`;
    csvContent += headers.join(',') + '\n';

    const row = [
        currentCarData.Brand,
        currentCarData.model,
        currentCarData.Year,
        currentCarData.Age,
        currentCarData.kmDriven,
        currentCarData.Transmission,
        currentCarData.Owner,
        currentCarData.FuelType,
        currentCarData.PostedDate,
        currentCarData.AskPrice,
        `"${currentCarData.AdditionInfo || ''}"`
    ];
    csvContent += row.join(',') + '\n';

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `VALUE_RIDE_${currentCarData.displayName.replace(/\s+/g, '_')}.csv`;
    link.click();
}