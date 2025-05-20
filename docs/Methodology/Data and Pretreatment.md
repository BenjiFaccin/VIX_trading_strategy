---
sidebar_position: 2
---

# Data and Pretreatment

The data utilized comprises all previously mentioned and replicated datasets. <u>These are updated on a weekly basis</u>, with no additional preprocessing applied, apart from the rebasing to 100 on row data, as outlined in the section detailing the replication of certain variables. 

It was then applied a **MinMaxScaler with a range of (0, 1) as a normalization** used to scale the values of independent variables to lie within the interval [0, 1]. It is a preprocessing step commonly applied before training machine learning or deep learning models to improve convergence and model performance. 

<div class="extra-space"></div>
MinMaxScaler used transforms each independent variables values using the formula:


<div class="extra-space"></div>
**I developed a <u>fully automated Python script that consolidates all tasks required to update, import, and save files for each independent variable</u>**. 

*For reporting purposes, the script is executed <u>every Wednesday</u>, ensuring that data from the preceding Monday is available, thereby operating on a D+2 basis*.