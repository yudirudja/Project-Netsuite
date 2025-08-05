	HOW TO USE IN SUITESCRIPT MODULES
gunakan config (if the variable name in define is config) config.get("nama_config_yang_mau_ditarik") [contoh struktur bisa diliha Contoh_1], jika masih ada struktur lagi dalam KEY ENV identifier (dalam kasus ini KEY ENV identifier adalah SANDBOX dan PRODUCTION) maka tambah seperti ini config.get("nama config yang mau ditarik").objek_didalam_ENV_IDENTIFIER [ contoh struktur bisa di lihat di Contoh_2].

(CONTOH_1:
order_discount_id: {
            SANDBOX: '14',
            PRODUCTION: '14' // Change if different
        },
)

(CONTOH_2:
 USER_ROLE: {
            SANDBOX: {
                FOR_HIDDEN_PRICE: [1038, 1035, 1036, 1033, 1037, 1034],
                ADMINISTRATOR: 3
            },

)

	HOW TO ADD MORE CONFIG DATA
tambahkan Key baru seperti biasa, TAMBAHKAN SANDBOX DAN PRODUCTION key sebagai ENV IDENTIFIER 
(Contoh: 
order_discount_id: {
            SANDBOX: '14',
            PRODUCTION: '14' // Change if different
        },
)

