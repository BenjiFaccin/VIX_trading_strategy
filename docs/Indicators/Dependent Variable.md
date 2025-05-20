---
sidebar_position: 3
---

# Dependent Variable

The dependent variable must be normalized to be viable for use and to train the neural network model. In this case, after experimenting with several types of normalization that were not sufficiently precise, I decided to **normalize my independent variable on a scale ranging from -1 to 1**, where <u>-1 corresponds to the lowest level of a cycle and 1 corresponds to the highest level of a cycle</u>. 

I used *linear interpolation* between each extreme to assign intra-top-bottom variables. The first data point begins in early 2014, and the last corresponds to the lowest level of the most recent cycle: November 2022.

Visually, the normalization of the dependent variable relative to the price appears as follows:



What you can immediately see is the non-consideration of second 2021-top, as on-chain metrics regarding my independent variables were too much contradictory.

Now that the dependent variable and independent variables are set, successfully replicated and automatically updated, let’s introduce Eclipse...
