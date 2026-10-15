"use strict";

// ===============================
// 1. DATA PRODUK
// ===============================

const produk = [
  {
    id: 1,
    nama: "One Piece Vol. 1",
    kategori: "Komik",
    harga: 45000,
    stok: 20,
  },
  {
    id: 2,
    nama: "Naruto Vol. 1",
    kategori: "Komik",
    harga: 42000,
    stok: 15,
  },
  {
    id: 3,
    nama: "Attack on Titan Vol. 1",
    kategori: "Komik",
    harga: 50000,
    stok: 12,
  },
  {
    id: 4,
    nama: "Demon Slayer Vol. 1",
    kategori: "Komik",
    harga: 43000,
    stok: 18,
  },
  {
    id: 5,
    nama: "Solo Leveling Vol. 1",
    kategori: "Manhwa",
    harga: 65000,
    stok: 15,
  },
  {
    id: 6,
    nama: "Lookism Vol. 1",
    kategori: "Manhwa",
    harga: 55000,
    stok: 12,
  },
  {
    id: 7,
    nama: "Omniscient Reader Vol. 1",
    kategori: "Manhwa",
    harga: 60000,
    stok: 10,
  },
  {
    id: 8,
    nama: "The Beginning After the End Vol. 1",
    kategori: "Manhwa",
    harga: 62000,
    stok: 8,
  },
];

// ===============================
// 2. VARIABEL TRANSAKSI
// ===============================

let keranjang = [];
let riwayat = [];
let kategoriAktif = "Semua";
let nomorTransaksi = 1;

// ===============================
// 3. FUNGSI BANTU
// ===============================

// Format angka menjadi Rupiah.
function rupiah(angka) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(angka);
}

// Mencegah teks produk dimasukkan sebagai HTML.
function aman(teks) {
  return String(teks).replace(
    /[&<>"']/g,
    (karakter) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      }[karakter])
  );
}

function ambilProduk(id) {
  return produk.find((item) => item.id === id);
}

function jumlahBarang() {
  return keranjang.reduce((jumlah, item) => jumlah + item.jumlah, 0);
}

function hitungSubtotal() {
  return keranjang.reduce((total, item) => {
    return total + item.harga * item.jumlah;
  }, 0);
}

function nilaiDiskon() {
  const input = document.getElementById("diskon");
  const nilai = Number(input.value);

  if (!Number.isFinite(nilai)) return 0;

  return Math.min(100, Math.max(0, nilai));
}

function hitungTotal() {
  const subtotal = hitungSubtotal();
  return subtotal - Math.round((subtotal * nilaiDiskon()) / 100);
}

function pesan(teks, jenis = "") {
  const elemen = document.getElementById("pesan");
  elemen.textContent = teks;
  elemen.className = "message " + jenis;
}

// ===============================
// 4. MENAMPILKAN PRODUK
// ===============================

function tampilkanProduk() {
  const kataKunci = document
    .getElementById("pencarian")
    .value.trim()
    .toLowerCase();

  const hasil = produk.filter((item) => {
    const cocokNama = item.nama.toLowerCase().includes(kataKunci);

    const cocokKategori =
      kategoriAktif === "Semua" || item.kategori === kategoriAktif;

    return cocokNama && cocokKategori;
  });

  const wadah = document.getElementById("daftarProduk");

  if (hasil.length === 0) {
    wadah.innerHTML = '<div class="empty"><p>Produk tidak ditemukan.</p></div>';
    return;
  }

  wadah.innerHTML = hasil
    .map(
      (item) => `
    <article class="product-item">
      <div class="product-info">
        <h3>${aman(item.nama)}</h3>
        <p>${aman(item.kategori)}</p>
        <div class="price">${rupiah(item.harga)}</div>
        <div class="stock ${item.stok === 0 ? "out" : ""}">
          Stok: ${item.stok}
        </div>
      </div>
      <button
        class="add-btn"
        data-tambah="${item.id}"
        ${item.stok === 0 ? "disabled" : ""}
      >
        + Tambah
      </button>
    </article>
  `
    )
    .join("");
}

// ===============================
// 5. KERANJANG BELANJA
// ===============================

function tambahKeranjang(id) {
  const itemProduk = ambilProduk(id);

  if (!itemProduk || itemProduk.stok <= 0) {
    pesan("Stok produk habis.", "error");
    return;
  }

  const itemKeranjang = keranjang.find((item) => item.id === id);

  if (itemKeranjang) {
    if (itemKeranjang.jumlah >= itemProduk.stok) {
      pesan("Jumlah melebihi stok yang tersedia.", "error");
      return;
    }

    itemKeranjang.jumlah++;
  } else {
    keranjang.push({
      id: itemProduk.id,
      nama: itemProduk.nama,
      harga: itemProduk.harga,
      jumlah: 1,
    });
  }

  pesan("");
  perbaruiTampilan();
}

function ubahJumlah(id, perubahan) {
  const item = keranjang.find((item) => item.id === id);
  const sumber = ambilProduk(id);

  if (!item || !sumber) return;

  const jumlahBaru = item.jumlah + perubahan;

  if (jumlahBaru <= 0) {
    hapusDariKeranjang(id);
    return;
  }

  if (jumlahBaru > sumber.stok) {
    pesan("Jumlah melebihi stok yang tersedia.", "error");
    return;
  }

  item.jumlah = jumlahBaru;
  pesan("");
  perbaruiTampilan();
}

function hapusDariKeranjang(id) {
  keranjang = keranjang.filter((item) => item.id !== id);
  pesan("");
  perbaruiTampilan();
}

function kosongkanKeranjang() {
  if (keranjang.length === 0) return;

  if (!confirm("Kosongkan semua isi keranjang?")) return;

  keranjang = [];
  document.getElementById("diskon").value = 0;
  document.getElementById("pembayaran").value = "";
  pesan("");
  perbaruiTampilan();
}

function tampilkanKeranjang() {
  const wadah = document.getElementById("daftarKeranjang");

  if (keranjang.length === 0) {
    wadah.innerHTML = `
      <div class="empty">
        <span>🛒</span>
        <p>Keranjang masih kosong.</p>
        <small>Pilih produk untuk memulai transaksi.</small>
      </div>
    `;
    return;
  }

  wadah.innerHTML = keranjang
    .map(
      (item) => `
    <article class="cart-item">
      <div class="cart-top">
        <strong>${aman(item.nama)}</strong>
        <button class="remove-btn" data-hapus="${item.id}">
          Hapus
        </button>
      </div>
      <div class="cart-bottom">
        <div class="quantity">
          <button
            data-ubah="${item.id}"
            data-arah="-1"
            aria-label="Kurangi jumlah"
          >−</button>
          <span>${item.jumlah}</span>
          <button
            data-ubah="${item.id}"
            data-arah="1"
            aria-label="Tambah jumlah"
            ${item.jumlah >= ambilProduk(item.id).stok ? "disabled" : ""}
          >+</button>
        </div>
        <strong>${rupiah(item.harga * item.jumlah)}</strong>
      </div>
    </article>
  `
    )
    .join("");
}

// ===============================
// 6. TOTAL DAN KEMBALIAN
// ===============================

function perbaruiRingkasan() {
  const subtotal = hitungSubtotal();
  const total = hitungTotal();
  const pembayaranInput = document.getElementById("pembayaran");

  const pembayaran =
    pembayaranInput.value.trim() === ""
      ? 0
      : Math.max(0, Number(pembayaranInput.value) || 0);

  const kembalian = Math.max(0, pembayaran - total);

  document.getElementById("subtotal").textContent = rupiah(subtotal);

  document.getElementById("total").textContent = rupiah(total);

  document.getElementById("kembalian").textContent = rupiah(kembalian);

  document.getElementById("jumlahProduk").textContent = produk.length;

  document.getElementById("jumlahKeranjang").textContent = jumlahBarang();

  document.getElementById("jumlahTransaksi").textContent = riwayat.length;
}

function perbaruiTampilan() {
  tampilkanProduk();
  tampilkanKeranjang();
  perbaruiRingkasan();
}

// ===============================
// 7. PROSES PEMBAYARAN
// ===============================

function prosesTransaksi() {
  if (keranjang.length === 0) {
    pesan("Keranjang masih kosong.", "error");
    return;
  }

  // Pastikan stok masih mencukupi.
  for (const item of keranjang) {
    const sumber = ambilProduk(item.id);

    if (!sumber || item.jumlah > sumber.stok) {
      pesan("Stok tidak mencukupi. Periksa kembali.", "error");
      perbaruiTampilan();
      return;
    }
  }

  const inputBayar = document.getElementById("pembayaran");
  const teksBayar = inputBayar.value.trim();
  const bayar = Number(teksBayar);
  const total = hitungTotal();

  if (teksBayar === "" || !Number.isSafeInteger(bayar) || bayar < 0) {
    pesan("Masukkan nominal pembayaran yang valid.", "error");
    return;
  }

  if (bayar < total) {
    pesan("Uang pembayaran masih kurang.", "error");
    return;
  }

  const namaInput = document.getElementById("namaPelanggan").value.trim();

  const transaksi = {
    nomor: nomorTransaksi++,
    pelanggan: namaInput || "Pelanggan Umum",
    waktu: new Date(),
    items: keranjang.map((item) => ({ ...item })),
    subtotal: hitungSubtotal(),
    diskonPersen: nilaiDiskon(),
    diskonNominal: hitungSubtotal() - total,
    total: total,
    bayar: bayar,
    kembalian: bayar - total,
  };

  // Kurangi stok hanya setelah validasi berhasil.
  transaksi.items.forEach((item) => {
    ambilProduk(item.id).stok -= item.jumlah;
  });

  riwayat.unshift(transaksi);

  // Siapkan struk sebelum keranjang dikosongkan.
  buatStruk(transaksi);

  keranjang = [];
  document.getElementById("diskon").value = 0;
  document.getElementById("pembayaran").value = "";
  document.getElementById("namaPelanggan").value = "";

  pesan(`Transaksi #${transaksi.nomor} berhasil!`, "success");

  perbaruiTampilan();
  tampilkanRiwayat();
}

// ===============================
// 8. RIWAYAT TRANSAKSI
// ===============================

function tampilkanRiwayat() {
  const tbody = document.getElementById("riwayatTransaksi");

  if (riwayat.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="5" class="empty-cell">
          Belum ada transaksi.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = riwayat
    .map(
      (item) => `
    <tr>
      <td>#${item.nomor}</td>
      <td>${aman(item.pelanggan)}</td>
      <td>${item.waktu.toLocaleString("id-ID")}</td>
      <td>${rupiah(item.total)}</td>
      <td>
        <button class="print-btn" data-cetak="${item.nomor}">
          Cetak struk
        </button>
      </td>
    </tr>
  `
    )
    .join("");
}

// ===============================
// 9. CETAK STRUK
// ===============================

function buatStruk(transaksi) {
  let area = document.getElementById("areaStruk");

  if (!area) {
    area = document.createElement("section");
    area.id = "areaStruk";
    area.style.display = "none";
    document.body.appendChild(area);
  }

  const waktu = transaksi.waktu.toLocaleString("id-ID");

  area.innerHTML = `
    <div style="text-align:center">
      <h2>MANGA DISTRICT</h2>
      <p>Toko Buku Komik & Manhwa</p>
      <p>STRUK PEMBAYARAN</p>
    </div>
    <hr>
    <p>No. Transaksi: #${transaksi.nomor}</p>
    <p>Tanggal: ${aman(waktu)}</p>
    <p>Pelanggan: ${aman(transaksi.pelanggan)}</p>
    <hr>
    ${transaksi.items
      .map(
        (item) => `
      <p>${aman(item.nama)}</p>
      <p>${item.jumlah} x ${rupiah(item.harga)}
      = ${rupiah(item.jumlah * item.harga)}</p>
    `
      )
      .join("")}
    <hr>
    <p>Subtotal: ${rupiah(transaksi.subtotal)}</p>
    <p>Diskon (${transaksi.diskonPersen}%):
      ${rupiah(transaksi.diskonNominal)}</p>
    <h3>Total: ${rupiah(transaksi.total)}</h3>
    <p>Bayar: ${rupiah(transaksi.bayar)}</p>
    <p>Kembalian: ${rupiah(transaksi.kembalian)}</p>
    <hr>
    <p style="text-align:center">Terima kasih telah berbelanja!</p>
    <p style="text-align:center">MANGA DISTRICT</p>
  `;
}

function cetakStruk(nomor) {
  const transaksi = riwayat.find((item) => item.nomor === nomor);

  if (!transaksi) return;

  buatStruk(transaksi);

  document.body.classList.add("printing");

  window.print();

  document.body.classList.remove("printing");
}

// ===============================
// 10. EVENT LISTENER
// ===============================

// Tombol tambah produk.
document.getElementById("daftarProduk").addEventListener("click", (event) => {
  const tombol = event.target.closest("[data-tambah]");
  if (!tombol) return;

  tambahKeranjang(Number(tombol.dataset.tambah));
});

// Tombol jumlah dan hapus di keranjang.
document
  .getElementById("daftarKeranjang")
  .addEventListener("click", (event) => {
    const tombolUbah = event.target.closest("[data-ubah]");
    const tombolHapus = event.target.closest("[data-hapus]");

    if (tombolUbah) {
      ubahJumlah(
        Number(tombolUbah.dataset.ubah),
        Number(tombolUbah.dataset.arah)
      );
    }

    if (tombolHapus) {
      hapusDariKeranjang(Number(tombolHapus.dataset.hapus));
    }
  });

// Pencarian produk.
document.getElementById("pencarian").addEventListener("input", tampilkanProduk);

// Filter kategori.
document.querySelectorAll(".filter-btn").forEach((tombol) => {
  tombol.addEventListener("click", () => {
    kategoriAktif = tombol.dataset.filter;

    document.querySelectorAll(".filter-btn").forEach((btn) => {
      btn.classList.toggle("active", btn === tombol);
    });

    tampilkanProduk();
  });
});

// Diskon dan pembayaran.
document.getElementById("diskon").addEventListener("input", perbaruiRingkasan);

document
  .getElementById("pembayaran")
  .addEventListener("input", perbaruiRingkasan);

// Tombol proses transaksi.
document
  .getElementById("prosesTransaksi")
  .addEventListener("click", prosesTransaksi);

// Tombol kosongkan keranjang.
document
  .getElementById("kosongkanKeranjang")
  .addEventListener("click", kosongkanKeranjang);

// Cetak ulang dari riwayat.
document
  .getElementById("riwayatTransaksi")
  .addEventListener("click", (event) => {
    const tombol = event.target.closest("[data-cetak]");
    if (!tombol) return;

    cetakStruk(Number(tombol.dataset.cetak));
  });

// Tanggal di dashboard.
document.getElementById("tanggal").textContent = new Date().toLocaleDateString(
  "id-ID",
  {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }
);

// Tampilkan tampilan awal.
perbaruiTampilan();
tampilkanRiwayat();
