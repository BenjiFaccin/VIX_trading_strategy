---
sidebar_position: 1
---

# Long Short Term Memory

*Long Short Term Memory (LSTM)* is a type of recurrent neural network (RNN) specifically designed to learn and retain patterns in sequences of data over long time periods. Traditional RNNs struggle with the "vanishing gradient" problem, which limits their ability to learn dependencies in long sequences. LSTMs solve this by using a **unique architecture with memory cells that can store, update, or forget information over time**. These cells are controlled by three gates: input, forget, and output gates, which regulate the flow of information into, out of, and within the cell, respectively.

### How LSTMs Work:
- **Forget Gate:**  Decides which information in the memory cell should be discarded by analyzing the current input and previous hidden state.
- **Input Gate:** Determines what new information should be added to the memory cell. This involves a candidate value (a potential memory update) and a modulation of its influence.
- **Output Gate:** Controls what part of the stored memory is used to compute the current output and the next hidden state.
By carefully combining these gates and updating the cell state, LSTMs can maintain relevant information while discarding irrelevant details, enabling them to capture long-term dependencies in sequential data.

<div class="extra-space"></div>

LSTMs are particularly well-suited for modeling and predicting the cyclical tops and bottoms in Bitcoin markets, forming the foundation of the "Eclipse" indicator. Bitcoin price movements are characterized by **temporal dependencies** and **recurrent cycles** influenced by macroeconomic factors, market sentiment, and blockchain-specific events, such as halvings. 

*The Eclipse indicator* leverages the LSTM's architecture to analyze and interpret these time-dependent dynamics, capturing both <u>short-term fluctuations</u> and <u>long-term trends</u> in the data.
<div class="extra-space"></div>

The Eclipse indicator capitalizes on the LSTM's ability to process sequential data and recognize nonlinear relationships between given variables. By selectively retaining and discarding information through its gating mechanisms, the LSTM can identify key patterns and turning points in Bitcoin’s price cycles. 

**This allows the Eclipse model to provide robust predictions of potential market reversals**, offering valuable insights for researchers and market participants seeking to anticipate cycle tops and bottoms with precision.
