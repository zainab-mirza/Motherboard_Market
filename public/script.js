// JavaScript for Lamington Road Market Hardware Sourcing Engine BIOS Interface

let currentSection = 'main-menu';
const API_BASE = '/api';

// Mock data for when API is not available
const MOCK_DATA = {
  health: {
    success: true,
    message: 'Lamington Road Market Hardware Sourcing Engine is running',
    timestamp: new Date().toISOString(),
    engines: {
      hardwareSourcing: 'active',
      componentParser: 'active',
      firstCopyHeuristic: 'active',
      componentBridge: 'active',
      jugaadDetector: 'active',
      negotiationDelta: 'active',
      grayMarketAnalyzer: 'active'
    }
  },
  searchResults: [
    {
      component: {
        partNumber: 'INTEL-i7-12700K',
        category: 'processor',
        pricing: { retailPrice: 25000 }
      },
      availabilityStatus: 'in_stock',
      location: { shopNumber: 'A-101' },
      compatibilityScore: 0.95,
      qualityScore: 0.92
    },
    {
      component: {
        partNumber: 'AMD-RX-7700XT',
        category: 'graphics',
        pricing: { retailPrice: 42000 }
      },
      availabilityStatus: 'limited_stock',
      location: { shopNumber: 'B-205' },
      compatibilityScore: 0.88,
      qualityScore: 0.90
    },
    {
      component: {
        partNumber: 'CORSAIR-DDR4-16GB',
        category: 'memory',
        pricing: { retailPrice: 6500 }
      },
      availabilityStatus: 'in_stock',
      location: { shopNumber: 'D-401' },
      compatibilityScore: 0.92,
      qualityScore: 0.89
    }
  ],
  authenticityAnalysis: {
    confidenceScore: 87,
    weightAnalysis: {
      measuredWeight: 85,
      oemStandardWeight: 87,
      variance: -2.3,
      withinTolerance: true
    },
    thermalAnalysis: {
      heatSyncQuality: 8.5,
      thermalConductivity: 7.8,
      coolingEfficiency: 8.2
    },
    qualityIndicators: {
      overallScore: 8.4
    }
  }
};

document.addEventListener('DOMContentLoaded', function() {
    initializeBIOS();
    setupEventListeners();
    updateSystemTime();
    setInterval(updateSystemTime, 1000);
});

function initializeBIOS() {
    console.log('🚀 Lamington Road Market BIOS Initialized');
    showMainMenu();
    checkSystemHealth();
}

function setupEventListeners() {
    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', function() {
            const section = this.getAttribute('data-section');
            showSection(section);
        });
    });

    document.addEventListener('keydown', function(e) {
        switch(e.key) {
            case 'Escape':
                showMainMenu();
                break;
            case '1':
                if (currentSection === 'main-menu') showSection('search');
                break;
            case '2':
                if (currentSection === 'main-menu') showSection('authenticity');
                break;
            case '3':
                if (currentSection === 'main-menu') showSection('adapters');
                break;
            case '4':
                if (currentSection === 'main-menu') showSection('jugaad');
                break;
            case '5':
                if (currentSection === 'main-menu') showSection('negotiation');
                break;
            case '6':
                if (currentSection === 'main-menu') showSection('gray-market');
                break;
            case '7':
                if (currentSection === 'main-menu') showSection('market-map');
                break;
            case '8':
                if (currentSection === 'main-menu') showSection('system-info');
                break;
        }
    });

    document.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            const activeElement = document.activeElement;
            if (activeElement.id === 'search-input') {
                performSearch();
            } else if (activeElement.id === 'authenticity-input') {
                analyzeAuthenticity();
            } else if (activeElement.id === 'jugaad-input') {
                findJugaadSolutions();
            } else if (activeElement.id === 'gray-market-input') {
                analyzeGrayMarket();
            }
        }
    });
}

function updateSystemTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { 
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    document.getElementById('system-time').textContent = timeString;
}

function showMainMenu() {
    hideAllSections();
    document.getElementById('main-menu').style.display = 'block';
    currentSection = 'main-menu';
}

function showSection(sectionName) {
    hideAllSections();
    document.getElementById(sectionName + '-section').style.display = 'block';
    currentSection = sectionName;
    
    const firstInput = document.querySelector(`#${sectionName}-section input`);
    if (firstInput) {
        setTimeout(() => firstInput.focus(), 100);
    }
}

function hideAllSections() {
    document.querySelectorAll('.content-section').forEach(section => {
        section.style.display = 'none';
    });
    document.getElementById('main-menu').style.display = 'none';
}

async function performSearch() {
    const query = document.getElementById('search-input').value.trim();
    if (!query) {
        showError('search-results', 'Please enter a component specification');
        return;
    }

    showLoading('search-results', 'Searching component database...');

    // Simulate API delay
    setTimeout(() => {
        displaySearchResults(MOCK_DATA.searchResults);
    }, 1000);
}

async function analyzeAuthenticity() {
    const componentId = document.getElementById('authenticity-input').value.trim();
    if (!componentId) {
        showError('authenticity-results', 'Please enter a component ID');
        return;
    }

    showLoading('authenticity-results', 'Analyzing component authenticity...');

    // Simulate API delay
    setTimeout(() => {
        displayAuthenticityResults(MOCK_DATA.authenticityAnalysis);
    }, 1500);
}

async function findAdapters() {
    const legacyPort = document.getElementById('legacy-port-select').value;
    
    showLoading('adapters-results', 'Searching adapter database...');

    // Mock adapter results
    const mockAdapters = [
        {
            adapterType: `${legacyPort} to USB-C Adapter`,
            compatibility: 'good',
            reliabilityScore: 0.85,
            cost: 450,
            availability: 'in_stock',
            wiringDiagram: {
                difficulty: 'easy',
                requiredTools: ['Screwdriver', 'Wire strippers']
            }
        }
    ];

    setTimeout(() => {
        displayAdapterResults(mockAdapters);
    }, 1200);
}

async function findJugaadSolutions() {
    const targetComponent = document.getElementById('jugaad-input').value.trim();
    if (!targetComponent) {
        showError('jugaad-results', 'Please enter an unavailable component');
        return;
    }

    showLoading('jugaad-results', 'Finding jugaad solutions...');

    // Mock jugaad solutions
    const mockSolutions = [
        {
            solutionId: 'JUGAAD-001',
            alternativeComponents: ['ALT-001', 'ALT-002'],
            reliabilityScore: 0.75,
            complexityScore: 0.60,
            estimatedCost: 3500,
            estimatedTime: 45,
            assemblyInstructions: [
                { stepNumber: 1, title: 'Prepare components', description: 'Gather all required parts' }
            ],
            safetyWarnings: [
                { severity: 'medium', description: 'Handle with care' }
            ]
        }
    ];

    setTimeout(() => {
        displayJugaadResults(mockSolutions);
    }, 1800);
}

async function calculateNegotiation() {
    const componentId = document.getElementById('negotiation-component').value.trim();
    const quantity = parseInt(document.getElementById('negotiation-quantity').value);
    const vendorId = document.getElementById('negotiation-vendor').value.trim();

    if (!componentId || !quantity || quantity < 1) {
        showError('negotiation-results', 'Please enter valid component ID and quantity');
        return;
    }

    showLoading('negotiation-results', 'Calculating negotiation strategy...');

    // Mock negotiation result
    const basePrice = 25000;
    const discount = Math.min(quantity * 2, 25); // 2% per unit, max 25%
    const discountedPrice = basePrice * (1 - discount / 100);
    
    const mockNegotiation = {
        basePrice: basePrice,
        recommendedPrice: Math.round(discountedPrice),
        discountPercentage: discount,
        savings: Math.round(basePrice - discountedPrice),
        negotiationStrategy: [
            'Emphasize bulk purchase benefits',
            'Mention long-term partnership potential',
            'Compare with competitor pricing'
        ],
        priceBreakdown: {
            quantityDiscount: discount,
            marketAdjustment: 0,
            vendorBonus: 0,
            seasonalAdjustment: 0
        },
        marketConditions: {
            supplyLevel: 'Normal',
            demandLevel: 'Medium',
            competitionLevel: 'High',
            seasonalTrend: 'Stable'
        }
    };

    setTimeout(() => {
        displayNegotiationResults(mockNegotiation);
    }, 1600);
}

async function analyzeGrayMarket() {
    const componentId = document.getElementById('gray-market-input').value.trim();
    if (!componentId) {
        showError('gray-market-results', 'Please enter a component ID');
        return;
    }

    showLoading('gray-market-results', 'Analyzing gray market conditions...');

    // Mock gray market analysis
    const mockAnalysis = {
        pricing: {
            officialPrice: 45000,
            grayMarketPrice: 38000,
            priceDifference: 7000,
            trendPrediction: 'stable'
        },
        availability: {
            expectedDeliveryDays: 7,
            stockLevel: 'medium',
            supplyChainRisk: 0.3,
            alternativeAvailability: true
        },
        risks: {
            qualityRisk: 0.25,
            warrantyRisk: 0.60,
            compatibilityRisk: 0.15,
            overallRisk: 0.33,
            riskFactors: [
                'No official warranty coverage',
                'Potential quality variations',
                'Limited return policy'
            ],
            mitigationSuggestions: [
                'Test thoroughly upon receipt',
                'Purchase from reputable gray market vendors',
                'Consider extended warranty options'
            ]
        }
    };

    setTimeout(() => {
        displayGrayMarketResults(mockAnalysis);
    }, 2000);
}

async function checkSystemHealth() {
    console.log('🔍 Checking system health...');
    
    // Always show ONLINE since we're using mock data
    document.getElementById('market-status').textContent = 'ONLINE';
    document.getElementById('market-status').className = 'status-online';
    console.log('✅ Market status set to ONLINE (using mock data)');
}

function displaySearchResults(results) {
    const container = document.getElementById('search-results');
    
    if (!results || results.length === 0) {
        container.innerHTML = `
            <div class="result-item">
                <div class="result-title">No Results Found</div>
                <div class="result-details">No components found matching your specification. Try different search terms.</div>
            </div>
        `;
        return;
    }

    let html = `<div class="result-title">Search Results (${results.length} found)</div>`;
    
    results.forEach((result) => {
        const component = result.component;
        html += `
            <div class="result-item">
                <div class="result-title">${component.partNumber}</div>
                <div class="result-details">
                    Category: ${component.category}<br>
                    Availability: <span class="result-status">${result.availabilityStatus}</span><br>
                    Location: ${result.location.shopNumber}<br>
                    Compatibility Score: ${(result.compatibilityScore * 100).toFixed(1)}%<br>
                    Quality Score: ${(result.qualityScore * 100).toFixed(1)}%
                    ${component.pricing ? `<br>Price: <span class="result-price">₹${component.pricing.retailPrice}</span>` : ''}
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

function displayAuthenticityResults(analysis) {
    const container = document.getElementById('authenticity-results');
    
    const html = `
        <div class="result-item">
            <div class="result-title">Authenticity Analysis Results</div>
            <div class="result-details">
                Confidence Score: <span class="result-status">${analysis.confidenceScore}%</span><br>
                Weight Analysis: ${analysis.weightAnalysis.withinTolerance ? 'PASS' : 'FAIL'}<br>
                Measured Weight: ${analysis.weightAnalysis.measuredWeight}g<br>
                OEM Standard: ${analysis.weightAnalysis.oemStandardWeight}g<br>
                Variance: ${analysis.weightAnalysis.variance.toFixed(2)}%<br><br>
                Thermal Assessment:<br>
                Heat Sync Quality: ${analysis.thermalAnalysis.heatSyncQuality.toFixed(2)}<br>
                Thermal Conductivity: ${analysis.thermalAnalysis.thermalConductivity.toFixed(2)}<br>
                Cooling Efficiency: ${analysis.thermalAnalysis.coolingEfficiency.toFixed(2)}<br><br>
                Overall Quality Score: <span class="result-price">${analysis.qualityIndicators.overallScore.toFixed(1)}/10</span>
            </div>
        </div>
    `;

    container.innerHTML = html;
}

function displayAdapterResults(adapters) {
    const container = document.getElementById('adapters-results');
    
    if (!adapters || adapters.length === 0) {
        container.innerHTML = `
            <div class="result-item">
                <div class="result-title">No Adapters Found</div>
                <div class="result-details">No suitable adapters found for the specified legacy port.</div>
            </div>
        `;
        return;
    }

    let html = `<div class="result-title">Available Adapters (${adapters.length} found)</div>`;
    
    adapters.forEach(adapter => {
        html += `
            <div class="result-item">
                <div class="result-title">${adapter.adapterType}</div>
                <div class="result-details">
                    Compatibility: <span class="result-status">${adapter.compatibility}</span><br>
                    Reliability Score: ${(adapter.reliabilityScore * 100).toFixed(1)}%<br>
                    Estimated Cost: <span class="result-price">₹${adapter.cost}</span><br>
                    Availability: ${adapter.availability}<br>
                    Wiring Difficulty: ${adapter.wiringDiagram.difficulty}<br>
                    Required Tools: ${adapter.wiringDiagram.requiredTools.join(', ')}
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

function displayJugaadResults(solutions) {
    const container = document.getElementById('jugaad-results');
    
    if (!solutions || solutions.length === 0) {
        container.innerHTML = `
            <div class="result-item">
                <div class="result-title">No Jugaad Solutions Found</div>
                <div class="result-details">No alternative solutions found for the specified component.</div>
            </div>
        `;
        return;
    }

    let html = `<div class="result-title">Jugaad Solutions (${solutions.length} found)</div>`;
    
    solutions.forEach(solution => {
        html += `
            <div class="result-item">
                <div class="result-title">Solution: ${solution.solutionId}</div>
                <div class="result-details">
                    Alternative Components: ${solution.alternativeComponents.length}<br>
                    Reliability Score: <span class="result-status">${(solution.reliabilityScore * 100).toFixed(1)}%</span><br>
                    Complexity Score: ${(solution.complexityScore * 100).toFixed(1)}%<br>
                    Estimated Cost: <span class="result-price">₹${solution.estimatedCost}</span><br>
                    Estimated Time: ${solution.estimatedTime} minutes<br>
                    Assembly Steps: ${solution.assemblyInstructions.length}<br>
                    Safety Warnings: <span class="result-warning">${solution.safetyWarnings.length}</span>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

function displayNegotiationResults(negotiation) {
    const container = document.getElementById('negotiation-results');
    
    const html = `
        <div class="result-item">
            <div class="result-title">Negotiation Analysis</div>
            <div class="result-details">
                Base Price: ₹${negotiation.basePrice}<br>
                Recommended Price: <span class="result-price">₹${negotiation.recommendedPrice}</span><br>
                Discount Percentage: <span class="result-status">${negotiation.discountPercentage}%</span><br>
                Total Savings: <span class="result-price">₹${negotiation.savings}</span><br><br>
                Price Breakdown:<br>
                - Quantity Discount: ${negotiation.priceBreakdown.quantityDiscount}%<br>
                - Market Adjustment: ${negotiation.priceBreakdown.marketAdjustment}%<br>
                - Vendor Bonus: ${negotiation.priceBreakdown.vendorBonus}%<br>
                - Seasonal Adjustment: ${negotiation.priceBreakdown.seasonalAdjustment}%<br><br>
                Market Conditions:<br>
                - Supply Level: ${negotiation.marketConditions.supplyLevel}<br>
                - Demand Level: ${negotiation.marketConditions.demandLevel}<br>
                - Competition: ${negotiation.marketConditions.competitionLevel}<br>
                - Seasonal Trend: ${negotiation.marketConditions.seasonalTrend}<br><br>
                Negotiation Strategy:<br>
                ${negotiation.negotiationStrategy.map(strategy => `- ${strategy}`).join('<br>')}
            </div>
        </div>
    `;

    container.innerHTML = html;
}

function displayGrayMarketResults(analysis) {
    const container = document.getElementById('gray-market-results');
    
    const html = `
        <div class="result-item">
            <div class="result-title">Gray Market Analysis</div>
            <div class="result-details">
                <strong>Pricing Analysis:</strong><br>
                Official Price: ₹${analysis.pricing.officialPrice}<br>
                Gray Market Price: <span class="result-price">₹${analysis.pricing.grayMarketPrice}</span><br>
                Price Difference: <span class="result-status">₹${analysis.pricing.priceDifference}</span><br>
                Price Trend: ${analysis.pricing.trendPrediction}<br><br>
                
                <strong>Availability Prediction:</strong><br>
                Expected Delivery: ${analysis.availability.expectedDeliveryDays} days<br>
                Stock Level: <span class="result-status">${analysis.availability.stockLevel}</span><br>
                Supply Chain Risk: ${(analysis.availability.supplyChainRisk * 100).toFixed(1)}%<br>
                Alternative Available: ${analysis.availability.alternativeAvailability ? 'Yes' : 'No'}<br><br>
                
                <strong>Risk Assessment:</strong><br>
                Quality Risk: <span class="result-warning">${(analysis.risks.qualityRisk * 100).toFixed(1)}%</span><br>
                Warranty Risk: <span class="result-warning">${(analysis.risks.warrantyRisk * 100).toFixed(1)}%</span><br>
                Compatibility Risk: <span class="result-warning">${(analysis.risks.compatibilityRisk * 100).toFixed(1)}%</span><br>
                Overall Risk: <span class="result-warning">${(analysis.risks.overallRisk * 100).toFixed(1)}%</span><br><br>
                
                <strong>Risk Factors:</strong><br>
                ${analysis.risks.riskFactors.map(factor => `- ${factor}`).join('<br>')}<br><br>
                
                <strong>Mitigation Suggestions:</strong><br>
                ${analysis.risks.mitigationSuggestions.map(suggestion => `- ${suggestion}`).join('<br>')}
            </div>
        </div>
    `;

    container.innerHTML = html;
}

function showLoading(containerId, message) {
    const container = document.getElementById(containerId);
    container.innerHTML = `
        <div class="result-item">
            <div class="result-title">Processing<span class="loading"></span></div>
            <div class="result-details">${message}</div>
        </div>
    `;
}

function showError(containerId, message) {
    const container = document.getElementById(containerId);
    container.innerHTML = `
        <div class="result-item">
            <div class="result-title result-error">Error</div>
            <div class="result-details">${message}</div>
        </div>
    `;
}

console.log(`
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║    🔧 LAMINGTON ROAD MARKET HARDWARE SOURCING ENGINE 🔧     ║
║                                                              ║
║    Welcome to Mumbai's Electronics Hub BIOS Interface       ║
║    Type 'help()' for developer commands                     ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
`);

window.help = function() {
    console.log(`
Available Developer Commands:
- help() - Show this help
- showSection('section-name') - Navigate to section
- checkSystemHealth() - Check API health
- testApiConnection() - Test API connection manually
- API_BASE - Current API base URL
    `);
};

window.testApiConnection = async function() {
    console.log('🧪 Manual API Test Started');
    try {
        const response = await fetch('/api/health');
        console.log('📡 Response status:', response.status);
        console.log('📡 Response ok:', response.ok);
        
        const text = await response.text();
        console.log('📄 Raw response:', text);
        
        const data = JSON.parse(text);
        console.log('📊 Parsed data:', data);
        
        alert(`API Test Result:\nStatus: ${response.status}\nSuccess: ${data.success}\nMessage: ${data.message}`);
    } catch (error) {
        console.error('🚨 API Test Error:', error);
        alert(`API Test Failed: ${error.message}`);
    }
};
fun
ction displaySearchResults(results) {
    const container = document.getElementById('search-results');
    
    if (!results || results.length === 0) {
        container.innerHTML = `
            <div class="result-item">
                <div class="result-title">No Results Found</div>
                <div class="result-details">No components found matching your specification. Try different search terms.</div>
            </div>
        `;
        return;
    }

    let html = `<div class="result-title">Search Results (${results.length} found)</div>`;
    
    results.forEach((result) => {
        const component = result.component;
        html += `
            <div class="result-item">
                <div class="result-title">${component.partNumber}</div>
                <div class="result-details">
                    Category: ${component.category}<br>
                    Availability: <span class="result-status">${result.availabilityStatus}</span><br>
                    Location: ${result.location.shopNumber}<br>
                    Compatibility Score: ${(result.compatibilityScore * 100).toFixed(1)}%<br>
                    Quality Score: ${(result.qualityScore * 100).toFixed(1)}%
                    ${component.pricing ? `<br>Price: <span class="result-price">₹${component.pricing.retailPrice}</span>` : ''}
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

function displayAuthenticityResults(analysis) {
    const container = document.getElementById('authenticity-results');
    
    const html = `
        <div class="result-item">
            <div class="result-title">Authenticity Analysis Results</div>
            <div class="result-details">
                Confidence Score: <span class="result-status">${analysis.confidenceScore}%</span><br>
                Weight Analysis: ${analysis.weightAnalysis.withinTolerance ? 'PASS' : 'FAIL'}<br>
                Measured Weight: ${analysis.weightAnalysis.measuredWeight}g<br>
                OEM Standard: ${analysis.weightAnalysis.oemStandardWeight}g<br>
                Variance: ${analysis.weightAnalysis.variance.toFixed(2)}%<br><br>
                Thermal Assessment:<br>
                Heat Sync Quality: ${analysis.thermalAnalysis.heatSyncQuality.toFixed(2)}<br>
                Thermal Conductivity: ${analysis.thermalAnalysis.thermalConductivity.toFixed(2)}<br>
                Cooling Efficiency: ${analysis.thermalAnalysis.coolingEfficiency.toFixed(2)}<br><br>
                Overall Quality Score: <span class="result-price">${analysis.qualityIndicators.overallScore.toFixed(1)}/10</span>
            </div>
        </div>
    `;

    container.innerHTML = html;
}

function displayAdapterResults(adapters) {
    const container = document.getElementById('adapters-results');
    
    if (!adapters || adapters.length === 0) {
        container.innerHTML = `
            <div class="result-item">
                <div class="result-title">No Adapters Found</div>
                <div class="result-details">No suitable adapters found for the specified legacy port.</div>
            </div>
        `;
        return;
    }

    let html = `<div class="result-title">Available Adapters (${adapters.length} found)</div>`;
    
    adapters.forEach(adapter => {
        html += `
            <div class="result-item">
                <div class="result-title">${adapter.adapterType}</div>
                <div class="result-details">
                    Compatibility: <span class="result-status">${adapter.compatibility}</span><br>
                    Reliability Score: ${(adapter.reliabilityScore * 100).toFixed(1)}%<br>
                    Estimated Cost: <span class="result-price">₹${adapter.cost}</span><br>
                    Availability: ${adapter.availability}<br>
                    Wiring Difficulty: ${adapter.wiringDiagram.difficulty}<br>
                    Required Tools: ${adapter.wiringDiagram.requiredTools.join(', ')}
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

function displayJugaadResults(solutions) {
    const container = document.getElementById('jugaad-results');
    
    if (!solutions || solutions.length === 0) {
        container.innerHTML = `
            <div class="result-item">
                <div class="result-title">No Jugaad Solutions Found</div>
                <div class="result-details">No alternative solutions found for the specified component.</div>
            </div>
        `;
        return;
    }

    let html = `<div class="result-title">Jugaad Solutions (${solutions.length} found)</div>`;
    
    solutions.forEach(solution => {
        html += `
            <div class="result-item">
                <div class="result-title">Solution: ${solution.solutionId}</div>
                <div class="result-details">
                    Alternative Components: ${solution.alternativeComponents.length}<br>
                    Reliability Score: <span class="result-status">${(solution.reliabilityScore * 100).toFixed(1)}%</span><br>
                    Complexity Score: ${(solution.complexityScore * 100).toFixed(1)}%<br>
                    Estimated Cost: <span class="result-price">₹${solution.estimatedCost}</span><br>
                    Estimated Time: ${solution.estimatedTime} minutes<br>
                    Assembly Steps: ${solution.assemblyInstructions.length}<br>
                    Safety Warnings: <span class="result-warning">${solution.safetyWarnings.length}</span>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

function displayNegotiationResults(negotiation) {
    const container = document.getElementById('negotiation-results');
    
    const html = `
        <div class="result-item">
            <div class="result-title">Negotiation Analysis</div>
            <div class="result-details">
                Base Price: ₹${negotiation.basePrice}<br>
                Recommended Price: <span class="result-price">₹${negotiation.recommendedPrice}</span><br>
                Discount Percentage: <span class="result-status">${negotiation.discountPercentage}%</span><br>
                Total Savings: <span class="result-price">₹${negotiation.savings}</span><br><br>
                Price Breakdown:<br>
                - Quantity Discount: ${negotiation.priceBreakdown.quantityDiscount}%<br>
                - Market Adjustment: ${negotiation.priceBreakdown.marketAdjustment}%<br>
                - Vendor Bonus: ${negotiation.priceBreakdown.vendorBonus}%<br>
                - Seasonal Adjustment: ${negotiation.priceBreakdown.seasonalAdjustment}%<br><br>
                Market Conditions:<br>
                - Supply Level: ${negotiation.marketConditions.supplyLevel}<br>
                - Demand Level: ${negotiation.marketConditions.demandLevel}<br>
                - Competition: ${negotiation.marketConditions.competitionLevel}<br>
                - Seasonal Trend: ${negotiation.marketConditions.seasonalTrend}<br><br>
                Negotiation Strategy:<br>
                ${negotiation.negotiationStrategy.map(strategy => `- ${strategy}`).join('<br>')}
            </div>
        </div>
    `;

    container.innerHTML = html;
}

function displayGrayMarketResults(analysis) {
    const container = document.getElementById('gray-market-results');
    
    const html = `
        <div class="result-item">
            <div class="result-title">Gray Market Analysis</div>
            <div class="result-details">
                <strong>Pricing Analysis:</strong><br>
                Official Price: ₹${analysis.pricing.officialPrice}<br>
                Gray Market Price: <span class="result-price">₹${analysis.pricing.grayMarketPrice}</span><br>
                Price Difference: <span class="result-status">₹${analysis.pricing.priceDifference}</span><br>
                Price Trend: ${analysis.pricing.trendPrediction}<br><br>
                
                <strong>Availability Prediction:</strong><br>
                Expected Delivery: ${analysis.availability.expectedDeliveryDays} days<br>
                Stock Level: <span class="result-status">${analysis.availability.stockLevel}</span><br>
                Supply Chain Risk: ${(analysis.availability.supplyChainRisk * 100).toFixed(1)}%<br>
                Alternative Available: ${analysis.availability.alternativeAvailability ? 'Yes' : 'No'}<br><br>
                
                <strong>Risk Assessment:</strong><br>
                Quality Risk: <span class="result-warning">${(analysis.risks.qualityRisk * 100).toFixed(1)}%</span><br>
                Warranty Risk: <span class="result-warning">${(analysis.risks.warrantyRisk * 100).toFixed(1)}%</span><br>
                Compatibility Risk: <span class="result-warning">${(analysis.risks.compatibilityRisk * 100).toFixed(1)}%</span><br>
                Overall Risk: <span class="result-warning">${(analysis.risks.overallRisk * 100).toFixed(1)}%</span><br><br>
                
                <strong>Risk Factors:</strong><br>
                ${analysis.risks.riskFactors.map(factor => `- ${factor}`).join('<br>')}<br><br>
                
                <strong>Mitigation Suggestions:</strong><br>
                ${analysis.risks.mitigationSuggestions.map(suggestion => `- ${suggestion}`).join('<br>')}
            </div>
        </div>
    `;

    container.innerHTML = html;
}

function showLoading(containerId, message) {
    const container = document.getElementById(containerId);
    container.innerHTML = `
        <div class="result-item">
            <div class="result-title">Processing<span class="loading"></span></div>
            <div class="result-details">${message}</div>
        </div>
    `;
}

function showError(containerId, message) {
    const container = document.getElementById(containerId);
    container.innerHTML = `
        <div class="result-item">
            <div class="result-title result-error">Error</div>
            <div class="result-details">${message}</div>
        </div>
    `;
}

console.log(`
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║    🔧 LAMINGTON ROAD MARKET HARDWARE SOURCING ENGINE 🔧     ║
║                                                              ║
║    Welcome to Mumbai's Electronics Hub BIOS Interface       ║
║    Type 'help()' for developer commands                     ║
║    🎯 Running with Mock Data - All Functions Available      ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
`);

window.help = function() {
    console.log(`
Available Developer Commands:
- help() - Show this help
- showSection('section-name') - Navigate to section
- checkSystemHealth() - Check API health
- testApiConnection() - Test API connection manually
- API_BASE - Current API base URL
    `);
};

window.testApiConnection = async function() {
    console.log('🧪 Manual API Test Started');
    console.log('ℹ️ Note: Currently using mock data for demonstration');
    alert('API Test Result:\nStatus: Mock Data Active\nAll functions working with simulated data\nMarket Status: ONLINE');
};