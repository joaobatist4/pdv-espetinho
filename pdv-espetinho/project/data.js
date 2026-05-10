// ── Dados centrais do sistema PDV Espetim do Bigode ──

const ALL_PERMISSIONS = [
  { id: "pdv",             label: "PDV / Caixa",        icon: "🏪", desc: "Registrar vendas e fechar contas" },
  { id: "pedidos",         label: "Pedidos",             icon: "🧾", desc: "Enviar e acompanhar pedidos" },
  { id: "estoque",         label: "Estoque completo",    icon: "📦", desc: "Visualizar e editar todo o estoque" },
  { id: "estoque_bebidas", label: "Estoque bebidas",     icon: "🍺", desc: "Entrada de bebidas apenas" },
  { id: "dashboard",       label: "Dashboard",           icon: "📊", desc: "Ver relatórios e métricas" },
  { id: "cadastro",        label: "Cadastro",            icon: "⚙️", desc: "Produtos, mesas e unidades" },
  { id: "usuarios",        label: "Usuários",            icon: "👥", desc: "Criar e editar usuários" },
];

const USERS = [
  { id: 1, name: "Admin",   role: "admin",     pin: "1234", avatar: "A", permissions: ["pdv","pedidos","estoque","dashboard","cadastro","usuarios"] },
  { id: 2, name: "Gerente", role: "gerente",   pin: "5678", avatar: "G", permissions: ["pdv","pedidos","estoque","dashboard"] },
  { id: 3, name: "Ana",     role: "garconete", pin: "1111", avatar: "N", permissions: ["pdv","pedidos","estoque_bebidas"] },
  { id: 4, name: "Bia",     role: "garconete", pin: "2222", avatar: "B", permissions: ["pdv","pedidos","estoque_bebidas"] },
  { id: 5, name: "Cozinha", role: "cozinha",   pin: "3333", avatar: "C", permissions: [] },
];

const ROLE_LABELS = {
  admin:     "Administrador",
  gerente:   "Gerente",
  garconete: "Atendente",
  cozinha:   "Cozinha",
};

const ROLE_PERMISSIONS = {
  admin:     ["pdv","pedidos","estoque","dashboard","cadastro","usuarios"],
  gerente:   ["pdv","pedidos","estoque","dashboard"],
  garconete: ["pdv","pedidos","estoque_bebidas"],
  cozinha:   [],
};

// ── Cardápio completo ──
const MENU = [
  // ESPETOS
  { id: 101, cat: "espetos", subcat: "Bovina",    name: "Carne Bovina",              price: 10.00, unit: "espeto",  kitchen: false },
  { id: 102, cat: "espetos", subcat: "Bovina",    name: "Coração Bovino",             price: 10.00, unit: "espeto",  kitchen: false },
  { id: 103, cat: "espetos", subcat: "Suína",     name: "Carne Suína",               price: 10.00, unit: "espeto",  kitchen: false },
  { id: 104, cat: "espetos", subcat: "Suína",     name: "Costela Suína",             price: 15.00, unit: "espeto",  kitchen: false },
  { id: 105, cat: "espetos", subcat: "Suína",     name: "Linguiça",                  price: 10.00, unit: "espeto",  kitchen: false },
  { id: 106, cat: "espetos", subcat: "Suína",     name: "Linguiça Picante",          price: 10.00, unit: "espeto",  kitchen: false },
  { id: 107, cat: "espetos", subcat: "Suína",     name: "Tripa",                     price: 10.00, unit: "espeto",  kitchen: false },
  { id: 108, cat: "espetos", subcat: "Aves",      name: "Coxinha da Asa",            price: 10.00, unit: "espeto",  kitchen: false },
  { id: 109, cat: "espetos", subcat: "Aves",      name: "Asa",                       price: 10.00, unit: "espeto",  kitchen: false },
  { id: 110, cat: "espetos", subcat: "Aves",      name: "Coração de Frango",         price: 10.00, unit: "espeto",  kitchen: false },
  { id: 111, cat: "espetos", subcat: "Aves",      name: "Filé de Frango",            price: 10.00, unit: "espeto",  kitchen: false },
  { id: 112, cat: "espetos", subcat: "Especiais", name: "Queijo Coalho com Bacon",   price: 15.00, unit: "espeto",  kitchen: false },
  { id: 113, cat: "espetos", subcat: "Especiais", name: "Queijo Coalho",             price: 15.00, unit: "espeto",  kitchen: false },
  { id: 114, cat: "espetos", subcat: "Especiais", name: "Ovo com Bacon",             price: 15.00, unit: "espeto",  kitchen: false },

  // PRATOS
  { id: 201, cat: "pratos", subcat: "Pratos",    name: "Mão de Vaca (P)",           price: 35.00, unit: "prato",   kitchen: true  },
  { id: 202, cat: "pratos", subcat: "Pratos",    name: "Mão de Vaca (G)",           price: 45.00, unit: "prato",   kitchen: true  },
  { id: 203, cat: "pratos", subcat: "Pratos",    name: "Panelada (P)",              price: 35.00, unit: "prato",   kitchen: true  },
  { id: 204, cat: "pratos", subcat: "Pratos",    name: "Panelada (G)",              price: 45.00, unit: "prato",   kitchen: true  },
  { id: 205, cat: "pratos", subcat: "Pratos",    name: "Fava (P)",                  price: 30.00, unit: "prato",   kitchen: true  },
  { id: 206, cat: "pratos", subcat: "Pratos",    name: "Fava (G)",                  price: 40.00, unit: "prato",   kitchen: true  },
  { id: 207, cat: "pratos", subcat: "Pratos",    name: "Carneiro (P)",              price: 35.00, unit: "prato",   kitchen: true  },
  { id: 208, cat: "pratos", subcat: "Pratos",    name: "Carneiro (G)",              price: 45.00, unit: "prato",   kitchen: true  },
  { id: 209, cat: "pratos", subcat: "Pratos",    name: "Feijão Verde Cremoso (P)",  price: 25.00, unit: "prato",   kitchen: true  },
  { id: 210, cat: "pratos", subcat: "Pratos",    name: "Feijão Verde Cremoso (G)",  price: 35.00, unit: "prato",   kitchen: true  },
  { id: 211, cat: "pratos", subcat: "Pratos",    name: "Assado de Panela (P)",      price: 30.00, unit: "prato",   kitchen: true  },
  { id: 212, cat: "pratos", subcat: "Pratos",    name: "Assado de Panela (G)",      price: 40.00, unit: "prato",   kitchen: true  },
  { id: 213, cat: "pratos", subcat: "Pratos",    name: "Arroz de Camarão",          price: 60.00, unit: "prato",   kitchen: true  },
  { id: 214, cat: "pratos", subcat: "Pratos",    name: "Camarão Alho e Óleo (P)",   price: 35.00, unit: "prato",   kitchen: true  },
  { id: 215, cat: "pratos", subcat: "Pratos",    name: "Camarão Alho e Óleo (G)",   price: 70.00, unit: "prato",   kitchen: true  },
  { id: 216, cat: "pratos", subcat: "Sopas",     name: "Sopa de Carne (P)",         price: 12.00, unit: "prato",   kitchen: true  },
  { id: 217, cat: "pratos", subcat: "Sopas",     name: "Sopa de Carne (G)",         price: 15.00, unit: "prato",   kitchen: true  },
  { id: 218, cat: "pratos", subcat: "Sopas",     name: "Caldo de Mocotó (P)",       price: 12.00, unit: "prato",   kitchen: true  },
  { id: 219, cat: "pratos", subcat: "Sopas",     name: "Caldo de Mocotó (G)",       price: 15.00, unit: "prato",   kitchen: true  },

  // GUARNIÇÕES
  { id: 301, cat: "guarnicoes", subcat: "Arroz", name: "Arroz (P)",                 price: 10.00, unit: "porção",  kitchen: true  },
  { id: 302, cat: "guarnicoes", subcat: "Arroz", name: "Arroz (G)",                 price: 15.00, unit: "porção",  kitchen: true  },
  { id: 303, cat: "guarnicoes", subcat: "Arroz", name: "Baião à Moda (P)",          price: 15.00, unit: "porção",  kitchen: true  },
  { id: 304, cat: "guarnicoes", subcat: "Arroz", name: "Baião à Moda (G)",          price: 20.00, unit: "porção",  kitchen: true  },
  { id: 305, cat: "guarnicoes", subcat: "Arroz", name: "Baião Tradicional (P)",     price: 10.00, unit: "porção",  kitchen: true  },
  { id: 306, cat: "guarnicoes", subcat: "Arroz", name: "Baião Tradicional (G)",     price: 15.00, unit: "porção",  kitchen: true  },
  { id: 307, cat: "guarnicoes", subcat: "Acomp", name: "Batata",                    price: 18.00, unit: "porção",  kitchen: true  },
  { id: 308, cat: "guarnicoes", subcat: "Acomp", name: "Macaxeira",                 price: 19.00, unit: "porção",  kitchen: true  },
  { id: 309, cat: "guarnicoes", subcat: "Acomp", name: "Calabresa Acebolada",       price: 19.00, unit: "porção",  kitchen: true  },
  { id: 310, cat: "guarnicoes", subcat: "Acomp", name: "Ovo Frito ou Cozido",       price: 2.50,  unit: "un",      kitchen: false },
  { id: 311, cat: "guarnicoes", subcat: "Acomp", name: "Pirão",                     price: 5.00,  unit: "porção",  kitchen: true  },
  { id: 312, cat: "guarnicoes", subcat: "Acomp", name: "Vinagrete",                 price: 3.00,  unit: "porção",  kitchen: false },

  // BEBIDAS ALCOÓLICAS
  { id: 401, cat: "bebidas", subcat: "Lata",      name: "Skol Lata",                price: 6.00,  unit: "un",      kitchen: false, stock: true },
  { id: 402, cat: "bebidas", subcat: "Lata",      name: "Devassa Lata",             price: 6.00,  unit: "un",      kitchen: false, stock: true },
  { id: 403, cat: "bebidas", subcat: "Lata",      name: "Brahma Duplo Malte Lata",  price: 6.50,  unit: "un",      kitchen: false, stock: true },
  { id: 404, cat: "bebidas", subcat: "Long Neck", name: "Heineken LN",              price: 11.00, unit: "un",      kitchen: false, stock: true },
  { id: 405, cat: "bebidas", subcat: "Long Neck", name: "Spaten LN",                price: 11.00, unit: "un",      kitchen: false, stock: true },
  { id: 406, cat: "bebidas", subcat: "Long Neck", name: "Stella LN",                price: 11.00, unit: "un",      kitchen: false, stock: true },
  { id: 407, cat: "bebidas", subcat: "Long Neck", name: "Budweiser LN",             price: 10.00, unit: "un",      kitchen: false, stock: true },
  { id: 408, cat: "bebidas", subcat: "Long Neck", name: "Corona LN",                price: 15.00, unit: "un",      kitchen: false, stock: true },
  { id: 409, cat: "bebidas", subcat: "Destilados",name: "Black & White",            price: 9.00,  unit: "dose",    kitchen: false, stock: true },
  { id: 410, cat: "bebidas", subcat: "Destilados",name: "Caipirinha",               price: 9.00,  unit: "un",      kitchen: false, stock: true },
  { id: 411, cat: "bebidas", subcat: "Destilados",name: "Campari",                  price: 8.00,  unit: "dose",    kitchen: false, stock: true },
  { id: 412, cat: "bebidas", subcat: "Destilados",name: "Dreher",                   price: 6.00,  unit: "dose",    kitchen: false, stock: true },
  { id: 413, cat: "bebidas", subcat: "Destilados",name: "Ypioca 150 Anos",          price: 15.00, unit: "un",      kitchen: false, stock: true },
  { id: 414, cat: "bebidas", subcat: "Destilados",name: "Cachaça (dose)",           price: 5.00,  unit: "dose",    kitchen: false, stock: true },
  { id: 415, cat: "bebidas", subcat: "Destilados",name: "Cachaça (meiota)",         price: 20.00, unit: "un",      kitchen: false, stock: true },
  { id: 416, cat: "bebidas", subcat: "Vinho",     name: "Vinho (taça)",             price: 9.00,  unit: "taça",    kitchen: false, stock: true },
  { id: 417, cat: "bebidas", subcat: "Vinho",     name: "Vinho (garrafa)",          price: 26.00, unit: "garrafa", kitchen: false, stock: true },

  // BEBIDAS NÃO ALCOÓLICAS
  { id: 501, cat: "nao_alcoolicas", subcat: "Água",         name: "Água sem Gás",       price: 3.00,  unit: "un",  kitchen: false, stock: true },
  { id: 502, cat: "nao_alcoolicas", subcat: "Água",         name: "Água com Gás",       price: 4.00,  unit: "un",  kitchen: false, stock: true },
  { id: 503, cat: "nao_alcoolicas", subcat: "Energético",   name: "Red Bull",           price: 14.00, unit: "un",  kitchen: false, stock: true },
  { id: 504, cat: "nao_alcoolicas", subcat: "Suco",         name: "Suco 300ml",         price: 7.00,  unit: "un",  kitchen: false, stock: false },
  { id: 505, cat: "nao_alcoolicas", subcat: "Suco",         name: "Suco Jarra 1L",      price: 18.00, unit: "jarra",kitchen: false, stock: false },
  { id: 506, cat: "nao_alcoolicas", subcat: "Refrigerante", name: "Refrigerante Lata",  price: 6.00,  unit: "un",  kitchen: false, stock: true },
  { id: 507, cat: "nao_alcoolicas", subcat: "Refrigerante", name: "Refrigerante 600ml", price: 8.00,  unit: "un",  kitchen: false, stock: true },
  { id: 508, cat: "nao_alcoolicas", subcat: "Refrigerante", name: "Refrigerante 1L",    price: 10.00, unit: "un",  kitchen: false, stock: true },
  { id: 509, cat: "nao_alcoolicas", subcat: "Refrigerante", name: "Refrigerante 2L",    price: 15.00, unit: "un",  kitchen: false, stock: true },
];

const CAT_LABELS = {
  espetos:       "Espetos",
  pratos:        "Pratos",
  guarnicoes:    "Guarnições",
  bebidas:       "Bebidas Alcoólicas",
  nao_alcoolicas:"Bebidas N/A",
};

const CAT_ICONS = {
  espetos:       "🔥",
  pratos:        "🍽️",
  guarnicoes:    "🥗",
  bebidas:       "🍺",
  nao_alcoolicas:"🥤",
};

// ── Estado inicial de estoque ──
const INITIAL_STOCK = MENU
  .filter(p => p.stock)
  .reduce((acc, p) => {
    acc[p.id] = { qty: Math.floor(Math.random() * 40) + 5, min: 6 };
    return acc;
  }, {});

// ── Insumos (matéria-prima / ingredientes) ──
const SUPPLY_CAT_LABELS = {
  carnes:        "Carnes",
  hortifruti:    "Hortifruti",
  mercearia:     "Mercearia",
  descartaveis:  "Descartáveis",
  gas_carvao:    "Gás & Carvão",
  limpeza:       "Limpeza",
  outros:        "Outros",
};

const SUPPLY_CAT_ICONS = {
  carnes:        "🥩",
  hortifruti:    "🥬",
  mercearia:     "🌾",
  descartaveis:  "🥡",
  gas_carvao:    "🔥",
  limpeza:       "🧽",
  outros:        "📦",
};

const INITIAL_SUPPLIES = [
  { id: 9001, name: "Carne bovina (alcatra)",  cat: "carnes",       unit: "kg",     cost: 42.00, qty: 18,  min: 8,   supplier: "Frigorífico Boa Carne" },
  { id: 9002, name: "Coração de frango",        cat: "carnes",       unit: "kg",     cost: 18.00, qty: 6,   min: 5,   supplier: "Avícola Sertaneja" },
  { id: 9003, name: "Linguiça toscana",         cat: "carnes",       unit: "kg",     cost: 28.00, qty: 12,  min: 6,   supplier: "Frigorífico Boa Carne" },
  { id: 9004, name: "Queijo coalho",            cat: "carnes",       unit: "kg",     cost: 38.00, qty: 4,   min: 5,   supplier: "Laticínios Vale" },
  { id: 9005, name: "Cebola",                   cat: "hortifruti",   unit: "kg",     cost: 5.00,  qty: 9,   min: 4,   supplier: "Sacolão Central" },
  { id: 9006, name: "Tomate",                   cat: "hortifruti",   unit: "kg",     cost: 7.00,  qty: 5,   min: 4,   supplier: "Sacolão Central" },
  { id: 9007, name: "Pimentão",                 cat: "hortifruti",   unit: "kg",     cost: 9.00,  qty: 2,   min: 2,   supplier: "Sacolão Central" },
  { id: 9008, name: "Limão",                    cat: "hortifruti",   unit: "kg",     cost: 6.50,  qty: 3,   min: 3,   supplier: "Sacolão Central" },
  { id: 9009, name: "Arroz branco tipo 1",      cat: "mercearia",    unit: "kg",     cost: 6.20,  qty: 25,  min: 10,  supplier: "Atacadão" },
  { id: 9010, name: "Feijão verde",             cat: "mercearia",    unit: "kg",     cost: 12.00, qty: 8,   min: 5,   supplier: "Atacadão" },
  { id: 9011, name: "Óleo de soja",             cat: "mercearia",    unit: "L",      cost: 8.50,  qty: 14,  min: 6,   supplier: "Atacadão" },
  { id: 9012, name: "Sal grosso",               cat: "mercearia",    unit: "kg",     cost: 3.00,  qty: 7,   min: 3,   supplier: "Atacadão" },
  { id: 9013, name: "Palito de espeto (bambu)", cat: "descartaveis", unit: "pacote", cost: 12.00, qty: 18,  min: 10,  supplier: "Embalagens Bigode" },
  { id: 9014, name: "Marmitex nº 8",            cat: "descartaveis", unit: "un",     cost: 0.95,  qty: 220, min: 100, supplier: "Embalagens Bigode" },
  { id: 9015, name: "Guardanapo",               cat: "descartaveis", unit: "pacote", cost: 4.50,  qty: 9,   min: 5,   supplier: "Embalagens Bigode" },
  { id: 9016, name: "Carvão vegetal",           cat: "gas_carvao",   unit: "kg",     cost: 4.50,  qty: 35,  min: 20,  supplier: "Carvoaria São José" },
  { id: 9017, name: "Gás GLP P13",              cat: "gas_carvao",   unit: "un",     cost: 120.00,qty: 2,   min: 2,   supplier: "Distrigás" },
  { id: 9018, name: "Detergente",               cat: "limpeza",      unit: "un",     cost: 3.50,  qty: 6,   min: 4,   supplier: "Atacadão" },
  { id: 9019, name: "Esponja de aço",           cat: "limpeza",      unit: "pacote", cost: 5.00,  qty: 3,   min: 3,   supplier: "Atacadão" },
];

// ── Mesas ──
const INITIAL_TABLES = [
  { id: 1,  label: "Mesa 1",   type: "mesa",    status: "livre"    },
  { id: 2,  label: "Mesa 2",   type: "mesa",    status: "ocupada"  },
  { id: 3,  label: "Mesa 3",   type: "mesa",    status: "ocupada"  },
  { id: 4,  label: "Mesa 4",   type: "mesa",    status: "livre"    },
  { id: 5,  label: "Mesa 5",   type: "mesa",    status: "livre"    },
  { id: 6,  label: "Mesa 6",   type: "mesa",    status: "conta"    },
  { id: 7,  label: "Mesa 7",   type: "mesa",    status: "livre"    },
  { id: 8,  label: "Mesa 8",   type: "mesa",    status: "ocupada"  },
  { id: 9,  label: "Balcão 1", type: "balcao",  status: "livre"    },
  { id: 10, label: "Balcão 2", type: "balcao",  status: "ocupada"  },
];

// Pedidos de exemplo (mesa 2 e 3)
const NOW = Date.now();
const INITIAL_ORDERS = [
  {
    id: "PED-001",
    tableId: 2,
    items: [
      { productId: 101, name: "Carne Bovina", qty: 3, price: 10, kitchen: true, status: "pronto" },
      { productId: 401, name: "Skol Lata",    qty: 3, price: 6,  kitchen: false, status: "entregue" },
    ],
    status: "aberto",
    openedAt: NOW - 45 * 60000,
    attendant: "Ana",
  },
  {
    id: "PED-002",
    tableId: 3,
    items: [
      { productId: 203, name: "Panelada (P)", qty: 2, price: 35, kitchen: true, status: "preparando" },
      { productId: 404, name: "Heineken LN",  qty: 2, price: 11, kitchen: false, status: "entregue" },
    ],
    status: "aberto",
    openedAt: NOW - 20 * 60000,
    attendant: "Bia",
  },
  {
    id: "PED-003",
    tableId: 8,
    items: [
      { productId: 105, name: "Linguiça",     qty: 4, price: 10, kitchen: true, status: "aguardando" },
      { productId: 506, name: "Refrig. Lata", qty: 4, price: 6,  kitchen: false, status: "entregue" },
    ],
    status: "aberto",
    openedAt: NOW - 10 * 60000,
    attendant: "Ana",
  },
];

// Vendas de exemplo para dashboard
function genSales() {
  const sales = [];
  let id = 1;
  const today = new Date();
  for (let d = 29; d >= 0; d--) {
    const date = new Date(today); date.setDate(today.getDate() - d);
    const count = Math.floor(Math.random() * 8) + 3;
    for (let o = 0; o < count; o++) {
      const items = [];
      const itemCount = Math.floor(Math.random() * 5) + 2;
      for (let i = 0; i < itemCount; i++) {
        const prod = MENU[Math.floor(Math.random() * MENU.length)];
        const qty = Math.floor(Math.random() * 3) + 1;
        items.push({ productId: prod.id, name: prod.name, qty, price: prod.price, cat: prod.cat });
      }
      const total = items.reduce((s, i) => s + i.qty * i.price, 0);
      sales.push({
        id: `HIST-${String(id++).padStart(4,"0")}`,
        tableId: Math.floor(Math.random() * 10) + 1,
        items,
        total,
        payment: ["dinheiro","pix","debito","credito"][Math.floor(Math.random()*4)],
        closedAt: new Date(date.setHours(18 + Math.floor(Math.random()*6), Math.floor(Math.random()*60))),
        attendant: ["Ana","Bia"][Math.floor(Math.random()*2)],
      });
    }
  }
  return sales;
}

Object.assign(window, {
  USERS, ROLE_LABELS, ROLE_PERMISSIONS, ALL_PERMISSIONS,
  MENU, CAT_LABELS, CAT_ICONS,
  INITIAL_STOCK, INITIAL_TABLES, INITIAL_ORDERS,
  INITIAL_SUPPLIES, SUPPLY_CAT_LABELS, SUPPLY_CAT_ICONS,
  genSales,
});
