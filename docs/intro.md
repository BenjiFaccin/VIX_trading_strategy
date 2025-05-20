---
sidebar_position: 1
---

# Eclipse 1.0 Model 

Ready to deep dive? Then go to **[Introduction](../docs/category/introduction/)**!

Otherwise, discover **Eclipse Model in 5 minutes** 🚀



## Long Short-Term Memory Neuronal Model

Eclipse was built using *LSTM neuronal network model*.

**Long Short Term Memory (LSTM)** is a type of recurrent neural network (RNN) specifically designed to learn and retain patterns in sequences of data over long time periods. Traditional RNNs struggle with the "vanishing gradient" problem, which limits their ability to learn dependencies in long sequences. LSTMs solve this by using a unique architecture with memory cells that can store, update, or forget information over time. These cells are controlled by three gates: input, forget, and output gates, which regulate the flow of information into, out of, and within the cell, respectively.

### How LSTMs work? 

1.	**Forget Gate:** Decides which information in the memory cell should be discarded by analyzing the current input and previous hidden state.
2.	**Input Gate:** Determines what new information should be added to the memory cell. This involves a candidate value (a potential memory update) and a modulation of its influence.
3.	**Output Gate:** Controls what part of the stored memory is used to compute the current output and the next hidden state.
By carefully combining these gates and updating the cell state, LSTMs can maintain relevant information while discarding irrelevant details, enabling them to capture long-term dependencies in sequential data.


## Why using LSTM to predict bitcoin top & bottom?

**LSTMs** are particularly well-suited for modeling and predicting the cyclical tops and bottoms in Bitcoin markets, forming the foundation of the "Eclipse" indicator. Bitcoin price movements are characterized by temporal dependencies and recurrent cycles influenced by macroeconomic factors, market sentiment, and blockchain-specific events, such as halvings. The Eclipse indicator leverages the LSTM's architecture to analyze and interpret these time-dependent dynamics, capturing both short-term fluctuations and long-term trends in the data.


## Some performances results

Current Eclipse (1.0) Model has following performances metrics:

| Metrics     | Training Set | Validation Set |
|------------|--------------|----------------|
| MAPE       | 5.2564       | 5.8080         |
| R²         | 0.9989       | 0.9988         |
| RMSE       | 0.0189       | 0.0208         |
| MAE        | 0.0143       | 0.0163         |


**MAPE (~5.26% Training, ~5.81% Validation)**: The model’s predictions deviate by only about 5-6% from the actual values on average, showcasing consistent relative accuracy.

**R² (~0.9989 Training, ~0.9988 Validation)**: It captures 99.9% of the variability in the data, proving it effectively learns and generalizes underlying patterns.

**RMSE (~0.0189 Training, ~0.0208 Validation)**: The root mean squared error reflects precise predictions, with minimal deviation from the actual values (around 0.02 units).

**MAE (~0.0143 Training, ~0.0163 Validation)**: The mean absolute error highlights the model's ability to stay close to true values, with errors of just ~0.016 units.


### ⚠️ Disclaimer
These metrics should not be taken into absolute validation and prediction for the future. 
The purpose of this model is not meant to be a financial advice, neither to make investment decisions. 
Use it at your own risk and responsibility. 