---
sidebar_position: 2
---

# Concerns and Objectives

The **main concern** isn’t about accurary of the current model, it’s about how long this model will be accurate enough. As evoked earlier, historical Bitcoin patterns’ cycles are very similar in terms duration and very different at the same time, especially in terms of expansion which tends to be logarithmic. This affects a lot the model as some independent variables I’ll use will show less extreme values through time. 


<img src="/img/logbtc.jpg" alt="Bitcoin Price and Fear & Greed Index" style={{ maxWidth: "100%" }} />
<div class="extra-space"></div>
While the concept of capitalizing on extremes of fear and greed is intuitive, translating this into a systematic and actionable tool requires careful analysis and validation. 

Additionally, the cryptomarket’s relatively short history poses a significant constraint, as the limited dataset may lead to overfitting or misinterpretation of patterns. Therefore, another key concern is ensuring that the indicator accounts for false signals, which could erode its effectiveness over time. 

That is why <u>I will update the model after every new local bottom* and local top*.</u>
This will enhance the ability to capture updated new trends, coefficients, seasonalities and other patterns up-to-date. 

The main objectives of this model will be to have both performance and validation very good metrics. Threshold, criteria and t-tests used are developed later. 
<div class="extra-space"></div>

Let's begin the Eclipse journey with **indicators** used. 

<div class="extra-space"></div>

****A new local top*** will be set if the price goes below the last cycle all-time-high (I will take the local ATH from the current cycle). 

****A new local bottom*** will be set if the price goes above the last ATH (I will take the local ATL from the current cycle). 

