// Global variables
let currentTab = 'dashboard';
let incidents = [];
let sources = [];
let currentPage = 1;
const itemsPerPage = 10;

// DOM Ready
document.addEventListener('DOMContentLoaded', function() {
    // Initialize UI
    initTabs();
    initModals();
    
    // Load sample data (in a real app, this would be API calls)
    loadSampleData();
    
    // Set up event listeners
    document.getElementById('filter-btn').addEventListener('click', filterIncidents);
    document.getElementById('source-filter-btn').addEventListener('click', filterSources);
    document.getElementById('add-incident-btn').addEventListener('click', showAddIncidentModal);
    document.getElementById('add-source-btn').addEventListener('click', showAddSourceModal);
    document.getElementById('saveIncidentBtn').addEventListener('click', saveIncident);
    document.getElementById('saveSourceBtn').addEventListener('click', saveSource);
    
    // Initialize charts
    initCharts();
});

// Initialize tab navigation
function initTabs() {
    const tabs = ['dashboard', 'incidents', 'sources', 'analytics'];
    
    tabs.forEach(tab => {
        document.getElementById(`${tab}-tab`).addEventListener('click', function(e) {
            e.preventDefault();
            currentTab = tab;
            
            // Hide all content
            document.querySelectorAll('.tab-content').forEach(content => {
                content.style.display = 'none';
            });
            
            // Show selected content
            document.getElementById(`${tab}-content`).style.display = 'block';
            
            // Update active tab styling
            document.querySelectorAll('.nav-link').forEach(link => {
                link.classList.remove('active');
            });
            this.classList.add('active');
            
            // Refresh data if needed
            if (tab === 'incidents') {
                renderIncidentsTable();
            } else if (tab === 'sources') {
                renderSourcesTable();
            }
        });
    });
}

// Initialize modals
function initModals() {
    const incidentModal = new bootstrap.Modal(document.getElementById('incidentModal'));
    const sourceModal = new bootstrap.Modal(document.getElementById('sourceModal'));
    
    // Clear form when modal is hidden
    document.getElementById('incidentModal').addEventListener('hidden.bs.modal', function() {
        document.getElementById('incidentForm').reset();
        document.getElementById('incidentId').value = '';
    });
    
    document.getElementById('sourceModal').addEventListener('hidden.bs.modal', function() {
        document.getElementById('sourceForm').reset();
        document.getElementById('sourceId').value = '';
    });
}

// Load sample data
function loadSampleData() {
    // Sample incidents
    incidents = [
        {
            id: 1,
            title: "Phishing attack on Indian bank customers",
            description: "Customers of major Indian banks targeted by sophisticated phishing campaign",
            date: "2023-05-15",
            sector: "FINANCE",
            severity: "HIGH",
            source: "CERT-In",
            sourceUrl: "https://www.cert-in.org.in"
        },
        {
            id: 2,
            title: "Data breach at healthcare provider",
            description: "Patient records exposed due to unsecured database",
            date: "2023-05-10",
            sector: "HEALTHCARE",
            severity: "MEDIUM",
            source: "Pastebin",
            sourceUrl: "https://pastebin.com/abc123"
        },
        {
            id: 3,
            title: "Ransomware attack on government portal",
            description: "State government website taken down by ransomware",
            date: "2023-05-05",
            sector: "GOVERNMENT",
            severity: "HIGH",
            source: "NCIIPC",
            sourceUrl: "https://www.nciipc.gov.in"
        },
        {
            id: 4,
            title: "Vulnerability in telecom infrastructure",
            description: "Critical vulnerability discovered in telecom equipment",
            date: "2023-04-28",
            sector: "TELECOM",
            severity: "MEDIUM",
            source: "Security Forum",
            sourceUrl: "https://forum.example.com"
        },
        {
            id: 5,
            title: "DDoS attack on e-commerce site",
            description: "Major Indian e-commerce site hit by DDoS attack",
            date: "2023-04-20",
            sector: "COMMERCE",
            severity: "LOW",
            source: "Social Media",
            sourceUrl: "https://twitter.com/example"
        }
    ];
    
    // Sample sources
    sources = [
        {
            id: 1,
            name: "CERT-In",
            url: "https://www.cert-in.org.in",
            type: "GOVERNMENT",
            active: true,
            lastChecked: "2023-05-18"
        },
        {
            id: 2,
            name: "NCIIPC",
            url: "https://www.nciipc.gov.in",
            type: "GOVERNMENT",
            active: true,
            lastChecked: "2023-05-17"
        },
        {
            id: 3,
            name: "Pastebin",
            url: "https://pastebin.com",
            type: "PASTEBIN",
            active: true,
            lastChecked: "2023-05-18"
        },
        {
            id: 4,
            name: "Security Forum",
            url: "https://forum.example.com",
            type: "FORUM",
            active: false,
            lastChecked: "2023-04-30"
        }
    ];
    
    // Update UI with sample data
    updateDashboard();
    renderIncidentsTable();
    renderSourcesTable();
}

// Update dashboard with statistics
function updateDashboard() {
    document.getElementById('total-incidents').textContent = incidents.length;
    document.getElementById('active-sources').textContent = sources.filter(s => s.active).length;
    
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('new-today').textContent = incidents.filter(i => i.date === today).length;
    
    document.getElementById('high-severity').textContent = incidents.filter(i => i.severity === 'HIGH').length;
    
    // Update recent incidents table
    const recentIncidents = incidents.slice(0, 5);
    const tbody = document.querySelector('#recent-incidents tbody');
    tbody.innerHTML = '';
    
    recentIncidents.forEach(incident => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${formatDate(incident.date)}</td>
            <td>${incident.title}</td>
            <td>${incident.sector}</td>
            <td><span class="badge ${getSeverityClass(incident.severity)}">${incident.severity}</span></td>
            <td>${incident.source}</td>
        `;
        tbody.appendChild(row);
    });
}

// Render incidents table
function renderIncidentsTable(filteredIncidents = null) {
    const data = filteredIncidents || incidents;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedData = data.slice(startIndex, startIndex + itemsPerPage);
    
    const tbody = document.querySelector('#incidents-table tbody');
    tbody.innerHTML = '';
    
    paginatedData.forEach(incident => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${formatDate(incident.date)}</td>
            <td>${incident.title}</td>
            <td>${incident.sector}</td>
            <td><span class="badge ${getSeverityClass(incident.severity)}">${incident.severity}</span></td>
            <td>${incident.source}</td>
            <td>
                <button class="btn btn-sm btn-outline-primary me-1 edit-incident" data-id="${incident.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger delete-incident" data-id="${incident.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    // Set up pagination
    renderPagination(data.length);
    
    // Add event listeners to edit/delete buttons
    document.querySelectorAll('.edit-incident').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = parseInt(this.getAttribute('data-id'));
            editIncident(id);
        });
    });
    
    document.querySelectorAll('.delete-incident').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = parseInt(this.getAttribute('data-id'));
            deleteIncident(id);
        });
    });
}

// Render sources table
function renderSourcesTable(filteredSources = null) {
    const data = filteredSources || sources;
    const tbody = document.querySelector('#sources-table tbody');
    tbody.innerHTML = '';
    
    data.forEach(source => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${source.name}</td>
            <td><a href="${source.url}" target="_blank">${source.url}</a></td>
            <td>${source.type}</td>
            <td>${source.lastChecked || 'Never'}</td>
            <td>
                <span class="badge ${source.active ? 'bg-success' : 'bg-secondary'}">
                    ${source.active ? 'Active' : 'Inactive'}
                </span>
            </td>
            <td>
                <button class="btn btn-sm btn-outline-primary me-1 edit-source" data-id="${source.id}">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger delete-source" data-id="${source.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(row);
    });
    
    // Add event listeners to edit/delete buttons
    document.querySelectorAll('.edit-source').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = parseInt(this.getAttribute('data-id'));
            editSource(id);
        });
    });
    
    document.querySelectorAll('.delete-source').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = parseInt(this.getAttribute('data-id'));
            deleteSource(id);
        });
    });
}

// Initialize charts
function initCharts() {
    // Timeline chart
    const timelineCtx = document.getElementById('timelineChart').getContext('2d');
    new Chart(timelineCtx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Incidents',
                data: [12, 19, 15, 22, 18, 10],
                borderColor: '#0d6efd',
                backgroundColor: 'rgba(13, 110, 253, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });
    
    // Sector chart
    const sectorCtx = document.getElementById('sectorChart').getContext('2d');
    new Chart(sectorCtx, {
        type: 'doughnut',
        data: {
            labels: ['Government', 'Finance', 'Healthcare', 'Telecom', 'Energy'],
            datasets: [{
                data: [35, 25, 15, 15, 10],
                backgroundColor: [
                    '#0d6efd',
                    '#20c997',
                    '#fd7e14',
                    '#6f42c1',
                    '#ffc107'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
    
    // Severity chart (for analytics tab)
    const severityCtx = document.getElementById('severityChart').getContext('2d');
    new Chart(severityCtx, {
        type: 'bar',
        data: {
            labels: ['High', 'Medium', 'Low'],
            datasets: [{
                label: 'Incidents by Severity',
                data: [15, 25, 10],
                backgroundColor: [
                    '#dc3545',
                    '#fd7e14',
                    '#28a745'
                ]
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
    
    // Source chart (for analytics tab)
    const sourceCtx = document.getElementById('sourceChart').getContext('2d');
    new Chart(sourceCtx, {
        type: 'pie',
        data: {
            labels: ['CERT-In', 'NCIIPC', 'Pastebin', 'Forums', 'Social Media'],
            datasets: [{
                data: [30, 20, 25, 15, 10],
                backgroundColor: [
                    '#0d6efd',
                    '#6610f2',
                    '#20c997',
                    '#fd7e14',
                    '#6f42c1'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
    
    // Trend chart (for analytics tab)
    const trendCtx = document.getElementById('trendChart').getContext('2d');
    new Chart(trendCtx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
            datasets: [
                {
                    label: 'High Severity',
                    data: [5, 4, 6, 3, 7],
                    borderColor: '#dc3545',
                    backgroundColor: 'rgba(220, 53, 69, 0.1)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Medium Severity',
                    data: [8, 7, 9, 10, 12],
                    borderColor: '#fd7e14',
                    backgroundColor: 'rgba(253, 126, 20, 0.1)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Low Severity',
                    data: [4, 5, 3, 6, 2],
                    borderColor: '#28a745',
                    backgroundColor: 'rgba(40, 167, 69, 0.1)',
                    tension: 0.4,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            interaction: {
                mode: 'index',
                intersect: false
            },
            plugins: {
                tooltip: {
                    mode: 'nearest'
                }
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Show add incident modal
function showAddIncidentModal() {
    const modal = bootstrap.Modal.getInstance(document.getElementById('incidentModal')) || 
                 new bootstrap.Modal(document.getElementById('incidentModal'));
    
    document.getElementById('incidentModalTitle').textContent = 'Add New Incident';
    document.getElementById('incidentId').value = '';
    document.getElementById('incidentForm').reset();
    document.getElementById('incidentDate').value = new Date().toISOString().split('T')[0];
    
    modal.show();
}

// Show add source modal
function showAddSourceModal() {
    const modal = bootstrap.Modal.getInstance(document.getElementById('sourceModal')) || 
                 new bootstrap.Modal(document.getElementById('sourceModal'));
    
    document.getElementById('sourceModalTitle').textContent = 'Add New Source';
    document.getElementById('sourceId').value = '';
    document.getElementById('sourceForm').reset();
    document.getElementById('sourceActive').checked = true;
    
    modal.show();
}

// Edit incident
function editIncident(id) {
    const incident = incidents.find(i => i.id === id);
    if (!incident) return;
    
    const modal = bootstrap.Modal.getInstance(document.getElementById('incidentModal')) || 
                 new bootstrap.Modal(document.getElementById('incidentModal'));
    
    document.getElementById('incidentModalTitle').textContent = 'Edit Incident';
    document.getElementById('incidentId').value = incident.id;
    document.getElementById('incidentTitle').value = incident.title;
    document.getElementById('incidentDate').value = incident.date;
    document.getElementById('incidentSector').value = incident.sector;
    document.getElementById('incidentSeverity').value = incident.severity;
    document.getElementById('incidentDescription').value = incident.description;
    document.getElementById('incidentSource').value = incident.source;
    document.getElementById('incidentUrl').value = incident.sourceUrl;
    
    modal.show();
}

// Edit source
function editSource(id) {
    const source = sources.find(s => s.id === id);
    if (!source) return;
    
    const modal = bootstrap.Modal.getInstance(document.getElementById('sourceModal')) || 
                 new bootstrap.Modal(document.getElementById('sourceModal'));
    
    document.getElementById('sourceModalTitle').textContent = 'Edit Source';
    document.getElementById('sourceId').value = source.id;
    document.getElementById('sourceName').value = source.name;
    document.getElementById('sourceUrl').value = source.url;
    document.getElementById('sourceType').value = source.type;
    document.getElementById('sourceActive').checked = source.active;
    
    modal.show();
}

// Save incident
function saveIncident() {
    const id = document.getElementById('incidentId').value;
    const isNew = !id;
    
    const incident = {
        title: document.getElementById('incidentTitle').value,
        date: document.getElementById('incidentDate').value,
        sector: document.getElementById('incidentSector').value,
        severity: document.getElementById('incidentSeverity').value,
        description: document.getElementById('incidentDescription').value,
        source: document.getElementById('incidentSource').value,
        sourceUrl: document.getElementById('incidentUrl').value
    };
    
    if (isNew) {
        // Add new incident
        incident.id = incidents.length > 0 ? Math.max(...incidents.map(i => i.id)) + 1 : 1;
        incidents.unshift(incident);
    } else {
        // Update existing incident
        const index = incidents.findIndex(i => i.id === parseInt(id));
        if (index !== -1) {
            incident.id = parseInt(id);
            incidents[index] = incident;
        }
    }
    
    // Close modal and refresh UI
    bootstrap.Modal.getInstance(document.getElementById('incidentModal')).hide();
    
    if (currentTab === 'dashboard') {
        updateDashboard();
    } else {
        renderIncidentsTable();
    }
    
    showNotification('Incident saved successfully!', 'success');
}

// Save source
function saveSource() {
    const id = document.getElementById('sourceId').value;
    const isNew = !id;
    
    const source = {
        name: document.getElementById('sourceName').value,
        url: document.getElementById('sourceUrl').value,
        type: document.getElementById('sourceType').value,
        active: document.getElementById('sourceActive').checked,
        lastChecked: new Date().toISOString().split('T')[0]
    };
    
    if (isNew) {
        // Add new source
        source.id = sources.length > 0 ? Math.max(...sources.map(s => s.id)) + 1 : 1;
        sources.unshift(source);
    } else {
        // Update existing source
        const index = sources.findIndex(s => s.id === parseInt(id));
        if (index !== -1) {
            source.id = parseInt(id);
            sources[index] = source;
        }
    }
    
    // Close modal and refresh UI
    bootstrap.Modal.getInstance(document.getElementById('sourceModal')).hide();
    
    if (currentTab === 'dashboard') {
        updateDashboard();
    } else {
        renderSourcesTable();
    }
    
    showNotification('Source saved successfully!', 'success');
}

// Delete incident
function deleteIncident(id) {
    if (confirm('Are you sure you want to delete this incident?')) {
        const index = incidents.findIndex(i => i.id === id);
        if (index !== -1) {
            incidents.splice(index, 1);
            renderIncidentsTable();
            showNotification('Incident deleted successfully!', 'success');
        }
    }
}

// Delete source
function deleteSource(id) {
    if (confirm('Are you sure you want to delete this source?')) {
        const index = sources.findIndex(s => s.id === id);
        if (index !== -1) {
            sources.splice(index, 1);
            renderSourcesTable();
            showNotification('Source deleted successfully!', 'success');
        }
    }
}

// Filter incidents
function filterIncidents() {
    const searchTerm = document.getElementById('incident-search').value.toLowerCase();
    const severityFilter = document.getElementById('severity-filter').value;
    const sectorFilter = document.getElementById('sector-filter').value;
    
    let filtered = incidents;
    
    if (searchTerm) {
        filtered = filtered.filter(i => 
            i.title.toLowerCase().includes(searchTerm) || 
            i.description.toLowerCase().includes(searchTerm)
        );
    }
    
    if (severityFilter) {
        filtered = filtered.filter(i => i.severity === severityFilter);
    }
    
    if (sectorFilter) {
        filtered = filtered.filter(i => i.sector === sectorFilter);
    }
    
    renderIncidentsTable(filtered);
}

// Filter sources
function filterSources() {
    const searchTerm = document.getElementById('source-search').value.toLowerCase();
    const typeFilter = document.getElementById('source-type-filter').value;
    
    let filtered = sources;
    
    if (searchTerm) {
        filtered = filtered.filter(s => 
            s.name.toLowerCase().includes(searchTerm) || 
            s.url.toLowerCase().includes(searchTerm)
        );
    }
    
    if (typeFilter) {
        filtered = filtered.filter(s => s.type === typeFilter);
    }
    
    renderSourcesTable(filtered);
}

// Render pagination
function renderPagination(totalItems) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const pagination = document.getElementById('incidents-pagination');
    pagination.innerHTML = '';
    
    // Previous button
    const prevLi = document.createElement('li');
    prevLi.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
    prevLi.innerHTML = `<a class="page-link" href="#">Previous</a>`;
    prevLi.addEventListener('click', function(e) {
        e.preventDefault();
        if (currentPage > 1) {
            currentPage--;
            renderIncidentsTable();
        }
    });
    pagination.appendChild(prevLi);
    
    // Page numbers
    for (let i = 1; i <= totalPages; i++) {
        const li = document.createElement('li');
        li.className = `page-item ${i === currentPage ? 'active' : ''}`;
        li.innerHTML = `<a class="page-link" href="#">${i}</a>`;
        li.addEventListener('click', function(e) {
            e.preventDefault();
            currentPage = i;
            renderIncidentsTable();
        });
        pagination.appendChild(li);
    }
    
    // Next button
    const nextLi = document.createElement('li');
    nextLi.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
    nextLi.innerHTML = `<a class="page-link" href="#">Next</a>`;
    nextLi.addEventListener('click', function(e) {
        e.preventDefault();
        if (currentPage < totalPages) {
            currentPage++;
            renderIncidentsTable();
        }
    });
    pagination.appendChild(nextLi);
}

// Helper functions
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
}

function getSeverityClass(severity) {
    switch (severity) {
        case 'HIGH': return 'badge-high';
        case 'MEDIUM': return 'badge-medium';
        case 'LOW': return 'badge-low';
        default: return 'badge-secondary';
    }
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} position-fixed top-0 end-0 m-3`;
    notification.style.zIndex = '1100';
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('fade');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}
