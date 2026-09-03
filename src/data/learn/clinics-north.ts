import type { ClinicEntry } from "../clinics";

/**
 * 北部強迫症診療名錄（基隆／台北／新北／桃園／新竹／苗栗）
 *
 * - 僅收錄官網可驗證之醫學中心／區域醫院精神科，以及官網明列強迫症專長之身心科診所。
 * - 全部 URL 已於寫入前以 curl 驗證（<400）。
 * - 臺北榮總總院與三軍總醫院官網擋 curl（403），依收錄原則改收同體系可驗證之分院，
 *   不列無法驗證之連結。
 * - 僅供參考，就醫前請自行向各單位確認門診與掛號資訊。
 */
export const entries: ClinicEntry[] = [
  {
    name: "國立臺灣大學醫學院附設醫院精神醫學部",
    county: "臺北市",
    region: "north",
    address: "臺北市中正區中山南路7號",
    phone: "(02)2312-3456",
    url: "https://www.ntuh.gov.tw/",
    features: ["設成人精神科與兒童心智科門診", "採網路預約掛號制"],
    note: "成人精神科限18歲以上，未滿請掛兒童心智科",
  },
  {
    name: "馬偕紀念醫院精神醫學部",
    county: "臺北市",
    region: "north",
    address: "臺北市中山區中山北路二段92號",
    phone: "(02)2543-3535",
    url: "https://www.mmh.org.tw/",
    features: ["台北與淡水院區皆設精神科門診", "另設自費心理諮詢門診"],
    note: "門診額滿請改掛其他時段，勿現場要求加號",
  },
  {
    name: "新光吳火獅紀念醫院精神科",
    county: "臺北市",
    region: "north",
    address: "臺北市士林區文昌路95號",
    phone: "(02)2833-2211",
    url: "https://www.skh.org.tw/skh/department/index.html?deptCode=PSY",
    features: ["提供心理諮商與團體心理治療", "提供配偶及家族協談服務"],
  },
  {
    name: "國泰綜合醫院精神科",
    county: "臺北市",
    region: "north",
    address: "臺北市大安區仁愛路四段280號",
    phone: "(02)2708-2121",
    url: "https://www.cgh.org.tw/",
    features: ["設精神科門診", "官網可查醫師門診表與掛號"],
  },
  {
    name: "臺北醫學大學附設醫院精神科",
    county: "臺北市",
    region: "north",
    address: "臺北市信義區吳興街252號",
    phone: "(02)2737-2181",
    url: "https://www.tmuh.org.tw/",
    features: ["設重複經顱磁刺激治療", "設日間留院復健病房"],
  },
  {
    name: "臺北市立聯合醫院松德院區",
    county: "臺北市",
    region: "north",
    address: "臺北市信義區松德路309號",
    phone: "(02)2726-3141",
    url: "https://tpech.gov.taipei/",
    features: ["精神醫療專責院區", "官網提供網路掛號查詢"],
  },
  {
    name: "亞東紀念醫院精神暨心身醫學部",
    county: "新北市",
    region: "north",
    address: "新北市板橋區南雅南路二段21號",
    phone: "(02)8966-7000",
    url: "https://www.femh.org.tw/",
    features: ["設精神暨心身醫學部", "官網提供網路掛號查詢"],
  },
  {
    name: "衛生福利部雙和醫院精神科",
    county: "新北市",
    region: "north",
    address: "新北市中和區中正路291號",
    phone: "(02)2249-0088",
    url: "https://www.shh.org.tw/",
    features: ["設兒童青少年心智門診", "設老年精神與飲食障礙門診", "設日間病房"],
  },
  {
    name: "林口長庚紀念醫院精神科",
    county: "桃園市",
    region: "north",
    address: "桃園市龜山區復興街5號",
    phone: "(03)328-1200",
    url: "https://www.cgmh.org.tw/",
    features: ["設精神科門診", "自費rTMS須經醫師門診評估"],
  },
  {
    name: "臺北榮民總醫院桃園分院精神科",
    county: "桃園市",
    region: "north",
    address: "桃園市桃園區成功路三段100號",
    phone: "(03)338-4889",
    url: "https://www.tyvh.gov.tw/",
    features: ["設精神科門診", "官網提供門診表與掛號查詢"],
  },
  {
    name: "衛生福利部桃園醫院精神科",
    county: "桃園市",
    region: "north",
    address: "桃園市桃園區中山路1492號",
    phone: "(03)369-9721",
    url: "https://www.tygh.mohw.gov.tw/",
    features: ["設精神科門診", "官網提供網路掛號查詢"],
  },
  {
    name: "基隆長庚紀念醫院精神科",
    county: "基隆市",
    region: "north",
    address: "基隆市安樂區麥金路222號",
    phone: "(02)2431-3131",
    url: "https://register.cgmh.org.tw/",
    features: ["長庚掛號系統可選基隆院區精神科", "初診可經網路預約登錄"],
  },
  {
    name: "周伯翰身心醫學診所",
    county: "新竹市",
    region: "north",
    url: "https://www.drbrainchou.com/ocd",
    features: ["官網明列強迫症為主治項目", "提供rTMS與腦功能評估"],
  },
  {
    name: "衛生福利部苗栗醫院身心專業團隊",
    county: "苗栗縣",
    region: "north",
    address: "苗栗縣苗栗市為公路747號",
    phone: "(037)261-920",
    url: "https://www.mil.mohw.gov.tw/?aid=home",
    features: ["診療項目含強迫症", "提供心理治療與職能治療"],
  },
];
