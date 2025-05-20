---
sidebar_position: 2
---

# Assumptions Analysis

The statistical tests performed on the residuals of the Eclipse model indicate that the model adheres well to assumptions critical for its validity and reliability in time-series forecasting.

- **Shapiro-Wilk Test (Statistic = 0.9819, p-value = 0.32554):** This test evaluates whether the residuals follow a normal distribution. The p-value of 0.32554 is greater than the typical significance level of 0.05, indicating no significant departure from normality. This suggests that the residuals are approximately normally distributed, which supports the reliability of the model’s predictions.

- **Kolmogorov-Smirnov Test (Statistic = 0.0439, p-value = 0.99645):** This test further assesses normality by comparing the residuals to a normal distribution. The extremely high p-value of 0.99645 confirms that the residuals align closely with a normal distribution, reinforcing the findings from the Shapiro-Wilk test.

- **Durbin-Watson Test (Statistic = 1.9360):** This statistic tests for autocorrelation in the residuals. A value close to 2 (specifically, 1.9360) indicates minimal autocorrelation, confirming that the residuals are independent. This is crucial for time-series models, as residual independence ensures unbiased predictions and validity of confidence intervals.

- **ADF Test (Statistic = -8.4595, p-value = 1.5810e-13):** The Augmented Dickey-Fuller test checks for stationarity in the residuals. The highly negative test statistic (-8.4595) and the p-value of 1.5810e-13 (far below 0.05) strongly reject the null hypothesis of non-stationarity. This result confirms that the residuals are stationary, meaning their statistical properties (e.g., mean and variance) remain constant over time.

- **Critical Values for ADF Test:** The test statistic (-8.4595) is significantly lower than the critical values at the 1% (-3.5171), 5% (-2.8994), and 10% (-2.5870) levels, further confirming the stationarity of the residuals.

<div class="extra-space"></div>

<img src="/img/AnalysisResults.jpg" alt="AnalysisResults" style={{ maxWidth: "100%" }} />