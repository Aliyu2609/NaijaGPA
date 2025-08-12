// Sample data for featured ads
const featuredAds = [
    {
        id: 1,
        title: "2015 Toyota Camry - Clean Title",
        price: "₦4,500,000",
        location: "Lagos, Nigeria",
        category: "vehicles",
        image: "images/car-sample.jpg"
    },
    {
        id: 2,
        title: "3-Bedroom Flat for Rent",
        price: "₦1,200,000/year",
        location: "Accra, Ghana",
        category: "property",
        image: "images/house-sample.jpg"
    },
    {
        id: 3,
        title: "iPhone 12 Pro Max - 256GB",
        price: "₦350,000",
        location: "Abuja, Nigeria",
        category: "electronics",
        image: "images/phone-sample.jpg"
    },
    {
        id: 4,
        title: "Marketing Manager Needed",
        salary: "$1,500/month",
        location: "Remote",
        category: "jobs",
        image: "images/job-sample.jpg"
    }
];

// Load featured ads on homepage
document.addEventListener('DOMContentLoaded', function() {
    const adsGrid = document.querySelector('.ads-grid');
    
    if (adsGrid) {
        featuredAds.forEach(ad => {
            const adCard = document.createElement('div');
            adCard.className = 'ad-card';
            adCard.innerHTML = `
                <img src="${ad.image}" alt="${ad.title}">
                <h4>${ad.title}</h4>
                <p class="price">${ad.price || ad.salary}</p>
                <p class="location">${ad.location}</p>
                <a href="#" class="btn">View Details</a>
            `;
            adsGrid.appendChild(adCard);
        });
    }
    
    // Form submissions
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            alert('Login functionality will be implemented in the full version');
            // In a real app, you would handle authentication here
        });
    }
    
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            
            if (password !== confirmPassword) {
                alert('Passwords do not match!');
                return;
            }
            
            alert('Account created successfully! (This is a demo)');
            // In a real app, you would send the data to your backend
        });
    }
    
    // Initialize all AdSense ads on the page
    if (typeof adsbygoogle !== 'undefined') {
        (adsbygoogle = window.adsbygoogle || []).push({});
    }
});