"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const region_entity_1 = require("../entities/region.entity");
const PROVINCES = [
    { name: '北京市', level: 1 },
    { name: '天津市', level: 1 },
    { name: '上海市', level: 1 },
    { name: '重庆市', level: 1 },
    { name: '河北省', level: 1 },
    { name: '山西省', level: 1 },
    { name: '辽宁省', level: 1 },
    { name: '吉林省', level: 1 },
    { name: '黑龙江省', level: 1 },
    { name: '江苏省', level: 1 },
    { name: '浙江省', level: 1 },
    { name: '安徽省', level: 1 },
    { name: '福建省', level: 1 },
    { name: '江西省', level: 1 },
    { name: '山东省', level: 1 },
    { name: '河南省', level: 1 },
    { name: '湖北省', level: 1 },
    { name: '湖南省', level: 1 },
    { name: '广东省', level: 1 },
    { name: '海南省', level: 1 },
    { name: '四川省', level: 1 },
    { name: '贵州省', level: 1 },
    { name: '云南省', level: 1 },
    { name: '陕西省', level: 1 },
    { name: '甘肃省', level: 1 },
    { name: '青海省', level: 1 },
    { name: '台湾省', level: 1 },
    { name: '内蒙古自治区', level: 1 },
    { name: '广西壮族自治区', level: 1 },
    { name: '西藏自治区', level: 1 },
    { name: '宁夏回族自治区', level: 1 },
    { name: '新疆维吾尔自治区', level: 1 },
    { name: '香港特别行政区', level: 1 },
    { name: '澳门特别行政区', level: 1 },
];
const CITY_SAMPLES = {
    '北京市': ['东城区', '西城区', '朝阳区', '海淀区'],
    '天津市': ['和平区', '河西区', '滨海新区'],
    '上海市': ['黄浦区', '浦东新区', '徐汇区', '静安区'],
    '重庆市': ['渝中区', '江北区', '渝北区', '南岸区'],
    '河北省': ['石家庄市', '唐山市', '保定市', '廊坊市'],
    '山西省': ['太原市', '大同市', '运城市'],
    '辽宁省': ['沈阳市', '大连市', '鞍山市'],
    '吉林省': ['长春市', '吉林市', '延边州'],
    '黑龙江省': ['哈尔滨市', '大庆市', '齐齐哈尔市'],
    '江苏省': ['南京市', '苏州市', '无锡市', '常州市'],
    '浙江省': ['杭州市', '宁波市', '温州市', '嘉兴市'],
    '安徽省': ['合肥市', '芜湖市', '蚌埠市'],
    '福建省': ['福州市', '厦门市', '泉州市'],
    '江西省': ['南昌市', '九江市', '赣州市'],
    '山东省': ['济南市', '青岛市', '烟台市', '潍坊市'],
    '河南省': ['郑州市', '洛阳市', '开封市'],
    '湖北省': ['武汉市', '宜昌市', '襄阳市'],
    '湖南省': ['长沙市', '株洲市', '衡阳市'],
    '广东省': ['广州市', '深圳市', '佛山市', '东莞市'],
    '海南省': ['海口市', '三亚市', '儋州市'],
    '四川省': ['成都市', '绵阳市', '德阳市'],
    '贵州省': ['贵阳市', '遵义市', '安顺市'],
    '云南省': ['昆明市', '大理州', '丽江市'],
    '陕西省': ['西安市', '咸阳市', '宝鸡市'],
    '甘肃省': ['兰州市', '天水市', '酒泉市'],
    '青海省': ['西宁市', '海东市'],
    '台湾省': ['台北市', '高雄市', '台中市'],
    '内蒙古自治区': ['呼和浩特市', '包头市', '鄂尔多斯市'],
    '广西壮族自治区': ['南宁市', '柳州市', '桂林市'],
    '西藏自治区': ['拉萨市', '日喀则市', '林芝市'],
    '宁夏回族自治区': ['银川市', '石嘴山市', '吴忠市'],
    '新疆维吾尔自治区': ['乌鲁木齐市', '喀什地区', '伊犁州'],
    '香港特别行政区': ['中西区', '湾仔区', '九龙区'],
    '澳门特别行政区': ['花地玛堂区', '圣安多尼堂区'],
};
const PARK_SAMPLES = {
    '南京市': ['南京高新区', '南京经开区', '江宁开发区'],
    '苏州市': ['苏州工业园区', '苏州高新区', '昆山开发区'],
    '无锡市': ['无锡高新区', '锡山开发区', '惠山开发区'],
    '杭州市': ['杭州经开区', '杭州高新区', '萧山经开区'],
    '宁波市': ['宁波经开区', '宁波高新区', '北仑开发区'],
    '广州市': ['广州经开区', '广州高新区', '南沙新区'],
    '深圳市': ['深圳高新区', '前海合作区', '坪山新区'],
    '佛山市': ['佛山经开区', '顺德高新区', '南海经开区'],
    '成都市': ['成都高新区', '成都经开区', '天府新区'],
    '武汉市': ['武汉东湖高新区', '武汉经开区', '东西湖经开区'],
    '西安市': ['西安高新区', '西安经开区', '西咸新区'],
    '重庆市': ['重庆两江新区', '重庆高新区', '重庆经开区'],
    '青岛市': ['青岛高新区', '青岛经开区', '西海岸新区'],
    '北京市': ['中关村科技园', '亦庄经开区', '海淀园'],
    '上海市': ['上海张江高科技园区', '上海自贸区', '漕河泾开发区'],
};
const dataSource = new typeorm_1.DataSource({
    type: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    username: process.env.DB_USERNAME || 'root',
    password: process.env.DB_PASSWORD || 'root',
    database: process.env.DB_DATABASE || 'industry_investment',
    entities: [region_entity_1.Region],
});
async function seedRegions() {
    await dataSource.initialize();
    console.log('Database connected. Seeding regions...');
    const repo = dataSource.getRepository(region_entity_1.Region);
    for (const p of PROVINCES) {
        let prov = await repo.findOne({ where: { name: p.name, level: 1 } });
        if (!prov) {
            prov = repo.create({ name: p.name, level: 1, parentId: null });
            prov = await repo.save(prov);
            console.log(`  Province created: ${prov.name} (id=${prov.id})`);
        }
        const cities = CITY_SAMPLES[p.name] || [];
        for (const cityName of cities) {
            let city = await repo.findOne({ where: { name: cityName, level: 2, parentId: prov.id } });
            if (!city) {
                city = repo.create({ name: cityName, level: 2, parentId: prov.id });
                city = await repo.save(city);
                console.log(`    City created: ${city.name} (id=${city.id})`);
            }
            const parks = PARK_SAMPLES[cityName] || [];
            for (const parkName of parks) {
                let park = await repo.findOne({ where: { name: parkName, level: 3, parentId: city.id } });
                if (!park) {
                    park = repo.create({ name: parkName, level: 3, parentId: city.id });
                    park = await repo.save(park);
                    console.log(`      Park created: ${park.name} (id=${park.id})`);
                }
            }
        }
    }
    await dataSource.destroy();
    console.log('Region seed completed.');
}
seedRegions().catch((err) => {
    console.error('Region seed failed:', err);
    process.exit(1);
});
//# sourceMappingURL=regions-seed.js.map