"""
LSTM time series model for Spirit Airlines cash and revenue prediction.
PyTorch implementation trained on quarterly data.
"""
import numpy as np
import json
import os
import torch
import torch.nn as nn
from torch.utils.data import DataLoader, TensorDataset

QUARTERLY_CASH = [
    1098, 1034, 912, 854,   # 2022
    801,  712,  634, 612,   # 2023
    423,  234,  123, 87,    # 2024
]

QUARTERLY_REVENUE = [
    1267, 1789, 2012, 1267,  # 2022 (approx from annual $5068M)
    1234, 1589, 1678, 1134,  # 2023
    978,  1234, 1189, 934,   # 2024
]

QUARTER_LABELS = [
    "Q1'22","Q2'22","Q3'22","Q4'22",
    "Q1'23","Q2'23","Q3'23","Q4'23",
    "Q1'24","Q2'24","Q3'24","Q4'24",
]


class LSTMModel(nn.Module):
    def __init__(self, input_size=1, hidden_size=32, num_layers=2, output_size=1):
        super().__init__()
        self.hidden_size = hidden_size
        self.num_layers = num_layers
        self.lstm = nn.LSTM(input_size, hidden_size, num_layers, batch_first=True, dropout=0.1)
        self.fc = nn.Linear(hidden_size, output_size)

    def forward(self, x):
        h0 = torch.zeros(self.num_layers, x.size(0), self.hidden_size)
        c0 = torch.zeros(self.num_layers, x.size(0), self.hidden_size)
        out, _ = self.lstm(x, (h0, c0))
        return self.fc(out[:, -1, :])


def make_sequences(data, seq_len=4):
    X, y = [], []
    for i in range(len(data) - seq_len):
        X.append(data[i:i+seq_len])
        y.append(data[i+seq_len])
    return np.array(X, dtype=np.float32), np.array(y, dtype=np.float32)


def train_lstm_series(series, name, seq_len=4, epochs=300):
    arr = np.array(series, dtype=np.float32)
    scale = arr.max()
    norm = arr / scale

    X, y = make_sequences(norm, seq_len)
    X_t = torch.tensor(X).unsqueeze(-1)
    y_t = torch.tensor(y).unsqueeze(-1)

    ds = TensorDataset(X_t, y_t)
    loader = DataLoader(ds, batch_size=4, shuffle=True)

    model = LSTMModel(input_size=1, hidden_size=32, num_layers=2)
    opt = torch.optim.Adam(model.parameters(), lr=0.008, weight_decay=1e-4)
    criterion = nn.MSELoss()

    model.train()
    for epoch in range(epochs):
        for xb, yb in loader:
            opt.zero_grad()
            pred = model(xb)
            loss = criterion(pred, yb)
            loss.backward()
            opt.step()

    # One-step-ahead predictions on training data
    model.eval()
    preds = []
    with torch.no_grad():
        for i in range(len(X_t)):
            p = model(X_t[i:i+1]).item() * scale
            preds.append(round(float(p), 1))

    # Forecast 4 quarters ahead (2025)
    window = list(norm[-seq_len:])
    future = []
    for _ in range(4):
        inp = torch.tensor([[window[-seq_len:]]]).float().permute(0, 2, 1).unsqueeze(-1).squeeze(0)
        inp = torch.tensor(window[-seq_len:]).float().unsqueeze(0).unsqueeze(-1)
        with torch.no_grad():
            nxt = model(inp).item()
        window.append(nxt)
        future.append(round(float(nxt * scale), 1))

    rmse = float(np.sqrt(np.mean((np.array(preds) - np.array(series[seq_len:])) ** 2)))
    print(f"  LSTM {name}: RMSE={rmse:.1f}, Future={future}")
    return preds, future, rmse, model, scale


def run_lstm(trained_dir: str):
    print("\n[LSTM] Training on Spirit quarterly cash and revenue...")

    cash_preds, cash_future, cash_rmse, cash_model, cash_scale = train_lstm_series(
        QUARTERLY_CASH, "Cash", seq_len=4, epochs=400
    )
    rev_preds, rev_future, rev_rmse, rev_model, rev_scale = train_lstm_series(
        QUARTERLY_REVENUE, "Revenue", seq_len=4, epochs=400
    )

    seq_len = 4
    results = {
        "cash": {
            "labels": QUARTER_LABELS,
            "actual": QUARTERLY_CASH,
            "lstm_pred": [None] * seq_len + cash_preds,
            "future_quarters": ["Q1'25","Q2'25","Q3'25","Q4'25"],
            "future_values": cash_future,
            "rmse": round(cash_rmse, 1),
        },
        "revenue": {
            "labels": QUARTER_LABELS,
            "actual": QUARTERLY_REVENUE,
            "lstm_pred": [None] * seq_len + rev_preds,
            "future_quarters": ["Q1'25","Q2'25","Q3'25","Q4'25"],
            "future_values": rev_future,
            "rmse": round(rev_rmse, 1),
        },
        "insight": f"LSTM trained on 12 quarters of Spirit data. Cash RMSE: ${cash_rmse:.0f}M. Model projects Q1'25 cash at ${cash_future[0]:.0f}M.",
    }

    torch.save(cash_model.state_dict(), os.path.join(trained_dir, "lstm_cash.pt"))
    torch.save(rev_model.state_dict(), os.path.join(trained_dir, "lstm_revenue.pt"))
    np.save(os.path.join(trained_dir, "lstm_scales.npy"), np.array([cash_scale, rev_scale]))

    with open(os.path.join(trained_dir, "lstm_results.json"), "w") as f:
        json.dump(results, f, indent=2)

    print(f"  Saved LSTM results → trained_models/lstm_results.json")
    return results
