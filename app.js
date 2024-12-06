import express from "express";
import bodyParser from "body-parser";
import axios from "axios";

const app = express();
app.use(bodyParser.json());

app.post("/predict", async (req, res) => {
  try {
    const {
      income,
      age,
      dependents,
      rent,
      loan_repayment,
      insurance,
      groceries,
      transport,
      eating_out,
      entertainment,
      utilities,
      healthcare,
      education,
      miscellaneous,
    } = req.body;

    if (
      income == null ||
      age == null ||
      dependents == null ||
      rent == null ||
      loan_repayment == null ||
      insurance == null ||
      groceries == null ||
      transport == null ||
      eating_out == null ||
      entertainment == null ||
      utilities == null ||
      healthcare == null ||
      education == null ||
      miscellaneous == null
    ) {
      return res.status(400).json({ error: "Semua input harus diisi." });
    }

    const instances = [
      income,
      age,
      dependents,
      rent,
      loan_repayment,
      insurance,
      groceries,
      transport,
      eating_out,
      entertainment,
      utilities,
      healthcare,
      education,
      miscellaneous,
    ];

    const vertexEndpoint = "https://asia-southeast2-aiplatform.googleapis.com/v1/projects/fabled-triumph-443603-e4/locations/asia-southeast2/endpoints/3250195954124455936:predict";

    const accessToken = "ya29.a0AeDClZDRfrw6rhwarHKl6WxB1G75nkBhmR2xkp9BsmA3d8rAzEXFYszYLvjShIDkHjYbuqVWbIm_LLX9olAL0_LnENpsXaCFOtai9PBv4T01_bWzQhyJx2UZSGUez76jyAF90EvWVqiHysdy5evlZ-BVdnVPvnnJvausAS3UJFCo5igaCgYKAV0SARISFQHGX2MiK_uZP-MwDixQL2We8TIb2Q0182"; // Ganti dengan token akses Anda

    const response = await axios.post(
      vertexEndpoint,
      { instances: [instances] },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    const predictionValue = response.data.predictions[0][0];

    const totalExpenditure =
      rent +
      loan_repayment +
      insurance +
      groceries +
      transport +
      eating_out +
      entertainment +
      utilities +
      healthcare +
      education +
      miscellaneous;
    const remainingIncome = income - totalExpenditure;

    let status;
    if (remainingIncome < 0) {
      status = "Needs Attention";
    } else {
      status = predictionValue >= 0.5 ? "On Track" : "Needs Attention";
    }

    res.json({
      detailKeuangan: {
        pendapatanBulanan: `IDR ${income.toLocaleString("id-ID")}`,
        pengeluaranBulanan: `IDR ${totalExpenditure.toLocaleString("id-ID")}`,
        sisaPendapatan: `IDR ${remainingIncome.toLocaleString("id-ID")}`,
      },
      hasilPrediksi: status === "On Track"
        ? "✅ Anda berada di jalur yang tepat dengan tujuan tabungan Anda. Pertahankan!"
        : "⚠️ Anda perlu menabung lebih banyak untuk mencapai target tabungan Anda.",
    });
  } catch (error) {
    console.error("Error saat mengirim permintaan ke Vertex AI:", error.response?.data || error.message);
    res.status(500).json({ error: "Gagal memproses prediksi. Periksa konfigurasi atau token Anda." });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
