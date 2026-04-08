# GreenPulse
### AI-Powered Micro-Climate & Commute Optimizer
**Developed for INNOVATEX 4.0: BuildWithAI 24-Hour Hackathon** *Organized by Presidency University, Bengaluru*

---

## Overview
Standard maps tell you the fastest way to get from point A to B. We built **GreenPulse** because, in cities like Bengaluru, the "fastest" route often takes you through a wall of smog or a 38°C heat island. We prioritize your lungs over the clock.

## The Team: **Team git commit**
We are a group of developers from **GCEM (Gopalan College of Engineering and Management)** passionate about mixing Spatial AI with urban wellness.

* **Likith D T** (Team Lead)
* **Bhargav Bhat**
* **Keerthan R**
* **Manoj V**

---

## The Problem
Air quality and temperature change drastically block-by-block. Commuters (especially pedestrians and two-wheeler riders) are unknowingly exposed to "pollution pockets" every day. Until now, there has been no tool to choose a path based on environmental health data.

## What it does
GreenPulse is a web-based MVP that calculates a **"Healthiest Route"** using real-time data:
* **Hyper-local AQI & Temp:** Live data integration from Google Air Quality API and OpenWeatherMap.
* **The "Lungs Score":** Every route is given a health rating. If a route is 2 minutes longer but 40% cleaner, GreenPulse highlights it.
* **Predictive Departure:** Using **Google Gemini**, the app suggests if you should wait 10-15 minutes for a "cleaner window" when smog levels are predicted to dip.

## Target Users
* **Vulnerable Commuters:** Pedestrians, cyclists, and the elderly.
* **Outdoor Workers:** Delivery partners with high exposure to pollutants.
* **Health-Conscious Parents:** Minimizing respiratory strain for children.
* **Urban Dwellers:** Anyone who values long-term health over 120 seconds of traffic.

---

## The Tech (The AI Part)
We use **Google Gemini** as an **Inference Engine** to handle Multi-Criteria Decision Making (MCDM).

Instead of hard-coded "if-else" statements, we feed raw JSON environmental data into the LLM. The AI evaluates the trade-offs between **Time, Heat, and AQI** to rank routes. It acts as a digital consultant that understands *why* a certain route is better for your health at that specific moment.

### **Our Stack:**
* **Frontend:** Streamlit / React (Mobile-responsive)
* **AI:** Google Gemini Pro API
* **Data:** Google Air Quality API, OpenWeatherMap API
* **Logic:** Python / LangChain

---

## How to Run Locally
1.  **Clone the repo**
    ```bash
    git clone https://github.com/likithdt/Team-git-commit.git
    cd greenpulse
    ```
2.  **Install requirements**
    ```bash
    pip install -r requirements.txt
    ```
3.  **Set up your keys**
    Create a `.env` file and add:
    ```text
    GEMINI_API_KEY=your_key_here
    WEATHER_API_KEY=your_key_here
    ```
4.  **Fire it up**
    ```bash
    streamlit run main.py
    ```

---

## 🔮 Future Vision
We aim to evolve into **wearable integration**. Imagine your smartwatch vibrating to tell you: *"Take the next right to avoid the high-CO2 zone."* We want to make **Healthy Routing** the new standard for smart cities.
