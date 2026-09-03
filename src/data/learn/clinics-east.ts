import type { ClinicEntry } from "../clinics";

/**
 * 東部及離島強迫症診療名錄（宜蘭／花蓮／臺東／澎湖／金門／連江）
 *
 * - 僅收錄官網可驗證之醫學中心／區域醫院精神科（身心科）。
 * - 全部 URL 已於寫入前以 curl 驗證（<400）。
 * - 東部離島精神科能量有限，各條均收全院精神科並註明實際服務範圍；
 *   台東馬偕分院官網靜態頁查無精神科掛號資訊，暫不收錄，臺東以部立臺東醫院為主。
 * - 僅供參考，就醫前請自行向各單位確認門診與掛號資訊。
 */
export const entries: ClinicEntry[] = [
  {
    name: "國立陽明交通大學附設醫院精神科",
    county: "宜蘭縣",
    region: "east",
    address: "宜蘭縣宜蘭市校舍路169號（蘭陽院區）",
    phone: "(03)932-5192",
    url: "https://www.hosp.nycu.edu.tw/",
    features: ["官網掛號設有精神科門診", "另設自費心理諮詢門診"],
    note: "分蘭陽與新民兩院區，掛號時請確認看診院區",
  },
  {
    name: "花蓮慈濟醫院精神醫學部",
    county: "花蓮縣",
    region: "east",
    address: "花蓮縣花蓮市中央路三段707號",
    phone: "03-8561825",
    url: "https://hlm.tzuchi.com.tw/home/index.php/psyc",
    features: ["設兒童青少年特別門診", "設心理治療與老人記憶特別門診", "設自殺防治中心與日間住院"],
    note: "另於台東關山分院開設成人及兒童青少年門診",
  },
  {
    name: "臺灣基督教門諾會醫療財團法人門諾醫院",
    county: "花蓮縣",
    region: "east",
    address: "花蓮縣花蓮市民權路44號",
    phone: "03-8241234",
    url: "https://cgmwsin.mch.org.tw/registerin/Register/A",
    features: ["官網掛號系統設有精神科（身心科）門診"],
    note: "另有壽豐分院，掛號時請確認看診院區",
  },
  {
    name: "衛生福利部臺東醫院精神科（身心科）",
    county: "臺東縣",
    region: "east",
    address: "臺東縣臺東市五權街1號",
    phone: "089-324112",
    url: "https://www.tait.mohw.gov.tw/?aid=51&pid=9",
    features: ["醫師專長含焦慮、憂鬱、失眠與思覺失調症", "提供酒藥癮與失智症診療"],
    note: "掛號專線089-324112轉1151至1153，門診異動以官網為準",
  },
  {
    name: "衛生福利部澎湖醫院",
    county: "澎湖縣",
    region: "east",
    address: "澎湖縣馬公市中正路10號",
    phone: "(06)9261151",
    url: "https://www.pngh.mohw.gov.tw/",
    features: ["設有精神科病房", "設有身心內科門診"],
    note: "離島精神科能量有限，掛號專線(06)9262408",
  },
  {
    name: "衛生福利部金門醫院精神科",
    county: "金門縣",
    region: "east",
    address: "金門縣金湖鎮復興路2號",
    phone: "082-332546",
    url: "https://www.kmhp.mohw.gov.tw/",
    features: ["官網掛號設精神科及兒童青少年精神科", "設有急性病房與日間留院"],
    note: "離島精神科能量有限，就醫前請先確認門診時段",
  },
  {
    name: "連江縣立醫院身心科",
    county: "連江縣",
    region: "east",
    phone: "0836-23995",
    url: "https://ljc.matsuh.gov.tw/OINetReg.WebRwd/Reg/DeptCalendar?DeptId=13",
    features: ["官網掛號系統設有身心科門診"],
    note: "多為支援醫師看診，務必先查官網門診表再掛號",
  },
];
