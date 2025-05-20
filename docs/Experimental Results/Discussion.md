---
sidebar_position: 4
---

# Discussion

While the Eclipse Indicator demonstrates robust predictive performance based on historical data and shows strong generalization capabilities, it is not without limitations. One significant constraint is its reliance on past patterns and relationships within the Bitcoin market. The model assumes that these relationships remain stable over time; however, markets, especially emerging ones like Bitcoin, are subject to significant structural changes. Factors such as regulatory developments, macroeconomic influences, and shifts in investor behavior can disrupt previously observed patterns, potentially reducing the accuracy of predictions.
<div class="extra-space"></div>

Additionally, the model’s reliance on selected features—while well-correlated with the dependent variable—means it is limited by the completeness and quality of the input data. Unexpected changes in market dynamics or the introduction of new, impactful variables that are not part of the current feature set may reduce the indicator's reliability. Moreover, the inherent complexity of deep learning models like LSTMs can sometimes obscure interpretability, making it challenging to identify the specific reasons for prediction errors when they occur.
<div class="extra-space"></div>

Given that the Bitcoin market is still emerging and characterized by rapid evolution, the Eclipse Indicator is expected to lose precision over time as market conditions deviate from the historical patterns it was trained on. To address this, the model will be systematically updated after each newly confirmed market top or bottom. This process ensures that the indicator remains aligned with the latest data and incorporates any structural changes in the market. By recalibrating the model periodically and redefining extreme values based on updated conditions, the Eclipse Indicator can maintain its relevance and accuracy as an essential tool for understanding Bitcoin's cyclical behavior.
