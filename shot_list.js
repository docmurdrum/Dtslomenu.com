// ══════════════════════════════════════════════
// SHOT_LIST.JS — SLO Shot List (100 spots)
// Best photo spots · Timing · Light · Tips
// ══════════════════════════════════════════════

var SHOT_CATS = [
  { id:'all',          label:'All',          emoji:'📸' },
  { id:'golden',       label:'Golden Hour',  emoji:'🌅' },
  { id:'nature',       label:'Nature',       emoji:'🌿' },
  { id:'architecture', label:'Architecture', emoji:'🏛' },
  { id:'hidden',       label:'Hidden',       emoji:'💎' },
  { id:'food',         label:'Food & Drink', emoji:'🍷' },
  { id:'seasonal',     label:'Seasonal',     emoji:'🌸' },
];

var SHOT_SPOTS = [
  {
    name:'Bishop Peak Summit',
    category:'golden',
    emoji:'🏔',
    timing:'Sunrise or late afternoon',
    light:'East-facing summit catches first light. West views go golden before sunset.',
    address:'Foothill Blvd & Patricia Dr, SLO',
    parking:'Foothill Blvd trailhead — arrive early, fills by 8am weekends',
    tips:'Allow 90 min to summit. Wide angle lens. Haze burns off by 9am.',
  },
  {
    name:'Cerro San Luis Summit',
    category:'golden',
    emoji:'🌅',
    timing:'Sunrise',
    light:'360 degree views — sun rises over Santa Lucias while valley is in shadow below.',
    address:'Mitchell Park, Lizzie St, SLO',
    parking:'Mitchell Park at the base — free',
    tips:'The M on the hillside makes a great foreground. 45 min hike.',
  },
  {
    name:'Islay Hill at Sunset',
    category:'golden',
    emoji:'🌄',
    timing:'1 hour before sunset',
    light:'The easternmost Sister catches the last golden light on its west face.',
    address:'Tank Farm Rd trailhead, SLO',
    parking:'Small lot at the trailhead off Tank Farm Rd',
    tips:'Short hike, 360 views. Downtown lights up as the sun sets.',
  },
  {
    name:'Edna Valley Vineyard Rows',
    category:'golden',
    emoji:'🍷',
    timing:'Late afternoon golden hour',
    light:'Vine rows running east-west catch raking afternoon light that emphasizes texture.',
    address:'Edna Valley, SLO',
    parking:'Visit Tolosa, Chamisal, or Wolff tasting rooms',
    tips:'Late September through October adds harvest activity. Ask permission first.',
  },
  {
    name:'Laguna Lake at Sunrise',
    category:'golden',
    emoji:'🌊',
    timing:'30 min before sunrise',
    light:'Mist rises off the lake in cool mornings. Cerro San Luis reflects in still water.',
    address:'Laguna Lake Park, Los Osos Valley Rd, SLO',
    parking:'Laguna Lake Park free lot',
    tips:'Best in fall and winter when mornings are cold enough for mist.',
  },
  {
    name:'Irish Hills Golden Hour',
    category:'golden',
    emoji:'🌿',
    timing:'Late afternoon',
    light:'Rolling oak savanna turns amber. Deer often visible at this hour.',
    address:'Irish Hills Natural Reserve, SLO',
    parking:'Trailhead on Los Osos Valley Rd',
    tips:'The open savanna with scattered oaks is classic Central Coast landscape.',
  },
  {
    name:'SLO Downtown Rooftop at Dusk',
    category:'golden',
    emoji:'🏙',
    timing:'Dusk — 20 min after sunset',
    light:'The blue hour turns SLO downtown into a painting. Taller buildings catch last light.',
    address:'Rooftop Bar, Hotel SLO, 210 Marsh St',
    parking:'Valet or street parking on Marsh St',
    tips:'The Hotel SLO rooftop is open to non-guests. Order a drink, stay for the light.',
  },
  {
    name:'Cuesta Grade Overlook at Sunrise',
    category:'golden',
    emoji:'🌄',
    timing:'Sunrise looking east',
    light:'The valley floor catches first light while the grade is still in shadow. Fog fills the valley in winter.',
    address:'US-101 Cuesta Grade viewpoint, SLO',
    parking:'Small pull-out on US-101 northbound near the summit',
    tips:'Best in winter when marine fog fills the valley below.',
  },
  {
    name:'Pismo Beach Pier at Sunset',
    category:'golden',
    emoji:'🌇',
    timing:'30 min before sunset',
    light:'The pier extends directly west into the sunset.',
    address:'Pismo Beach Pier, Pismo Beach',
    parking:'Pier Avenue lot — often free after 6pm',
    tips:'Shoot back toward shore for town silhouette. Long exposure for wave texture.',
  },
  {
    name:'Reservoir Canyon at Golden Hour',
    category:'golden',
    emoji:'🌸',
    timing:'Late afternoon',
    light:'The canyon walls glow orange. Wildflowers in spring catch warm backlight.',
    address:'Reservoir Canyon Rd, SLO',
    parking:'Small lot at the canyon entrance',
    tips:'Face uphill for backlit wildflowers in March-May.',
  },
  {
    name:'SLO Botanical Garden at Dusk',
    category:'golden',
    emoji:'🌺',
    timing:'Late afternoon',
    light:'The native plants catch warm light and the creek reflects the sky.',
    address:'San Luis Obispo Botanical Garden, SLO',
    parking:'Parking on the main road near El Chorro Park',
    tips:'Free admission. Least crowded on weekday evenings.',
  },
  {
    name:'Madonna Mountain from the Valley',
    category:'golden',
    emoji:'🌄',
    timing:'Sunrise and late afternoon',
    light:'The M on the mountain catches first and last light. Best from the valley floor.',
    address:'Laguna Lake area or Los Osos Valley Rd, SLO',
    parking:'Pull over anywhere along Los Osos Valley Rd for the full view',
    tips:'The mountain turns gold while the valley is still in shadow at sunrise.',
  },
  {
    name:'Perfumo Canyon Road at Dusk',
    category:'golden',
    emoji:'🌿',
    timing:'Late afternoon',
    light:'A winding road through oak woodland that glows in the late afternoon.',
    address:'Perfumo Canyon Rd, SLO',
    parking:'Park at the base and walk or drive slowly',
    tips:'One of the most underrated drives in SLO. Oaks arch over the road.',
  },
  {
    name:'Foothill Blvd Morros at Sunrise',
    category:'golden',
    emoji:'🏔',
    timing:'Sunrise',
    light:'The full row of Nine Sisters catches first light simultaneously from Foothill Blvd.',
    address:'Foothill Blvd near Patricia Dr, SLO',
    parking:'Street parking on Foothill Blvd',
    tips:'A clear winter morning reveals all nine morros glowing simultaneously.',
  },
  {
    name:'Johnson Ranch Trailhead at Dusk',
    category:'golden',
    emoji:'🌄',
    timing:'Late afternoon',
    light:'Rolling hills turn amber. Views of Madonna Mountain and Cerro San Luis.',
    address:'Johnson Ranch Open Space, Hwy 227, SLO',
    parking:'Signed lot on Hwy 227 south of SLO',
    tips:'The ridge trail gives a panoramic view of SLO in golden light.',
  },
  {
    name:'Poly Canyon at Golden Hour',
    category:'golden',
    emoji:'🏗',
    timing:'Late afternoon',
    light:'The experimental architecture catches warm light in a unique canyon setting.',
    address:'Poly Canyon Rd, Cal Poly, SLO',
    parking:'Cal Poly visitor parking',
    tips:'The structures are completely unique. Each one has its own story.',
  },
  {
    name:'SLO Creek Behind Higuera at Dusk',
    category:'golden',
    emoji:'🌉',
    timing:'Golden hour evening',
    light:'The restaurants illuminate the creek. String lights reflect in the water.',
    address:'Higuera St footbridge, Downtown SLO',
    parking:'Palm St garage',
    tips:'Thursday adds Farmers Market lights and energy.',
  },
  {
    name:'Bishops Peak from Below at Sunset',
    category:'golden',
    emoji:'🏔',
    timing:'30 min before sunset',
    light:'The peak silhouettes dramatically against the sunset sky when viewed from Foothill.',
    address:'Foothill Blvd, SLO',
    parking:'Pull-outs along Foothill Blvd',
    tips:'A telephoto compresses the Sister against the colored sky beautifully.',
  },
  {
    name:'El Chorro Open Space at Sunrise',
    category:'golden',
    emoji:'🌿',
    timing:'Sunrise',
    light:'The open grassland glows and ground squirrels are active at first light.',
    address:'El Chorro Regional Park, Hwy 1, SLO',
    parking:'El Chorro Regional Park lot — day use fee',
    tips:'Hawks and red-tailed kites hunt in the morning thermal updrafts here.',
  },
  {
    name:'Stenner Creek Road at Dusk',
    category:'golden',
    emoji:'🌿',
    timing:'Late afternoon',
    light:'A canopied creek road through eucalyptus and oak that glows in filtered light.',
    address:'Stenner Creek Rd, SLO',
    parking:'Street parking near Cal Poly north entrance',
    tips:'The road is lined with massive eucalyptus that create a cathedral effect.',
  },
  {
    name:'Bishop Peak Rocky Summit',
    category:'nature',
    emoji:'🪨',
    timing:'Morning for dramatic shadows',
    light:'The volcanic rock formations cast long shadows in morning light.',
    address:'Bishop Peak Trail, SLO',
    parking:'Foothill Blvd trailhead',
    tips:'A telephoto reveals the texture of the volcanic plug in raking light.',
  },
  {
    name:'Laguna Lake Egrets',
    category:'nature',
    emoji:'🦢',
    timing:'Early morning',
    light:'Great egrets and great blue herons hunt in the shallows at dawn.',
    address:'Laguna Lake Park, SLO',
    parking:'Free parking in the park',
    tips:'Bring a 300mm+ lens. The birds are most active in the first hour of light.',
  },
  {
    name:'Irish Hills Deer at Dawn',
    category:'nature',
    emoji:'🦌',
    timing:'First hour of daylight',
    light:'Mule deer graze in the open savanna before retreating to the shade.',
    address:'Irish Hills Natural Reserve, SLO',
    parking:'Trailhead on Los Osos Valley Rd',
    tips:'Walk quietly. Deer are most visible in the open grassland near the trailhead.',
  },
  {
    name:'Reservoir Canyon Wildflowers',
    category:'nature',
    emoji:'🌸',
    timing:'March through May, mid-morning',
    light:'Lupine, poppies, and brodaea cover the hillsides in wet years.',
    address:'Reservoir Canyon Rd, SLO',
    parking:'Canyon entrance lot',
    tips:'A wet winter guarantees an exceptional bloom in late March.',
  },
  {
    name:'Poly Canyon Rock Formations',
    category:'nature',
    emoji:'🪨',
    timing:'Mid-morning for even light',
    light:'Ancient volcanic rock outcrops surround the canyon.',
    address:'Poly Canyon, Cal Poly, SLO',
    parking:'Cal Poly visitor parking',
    tips:'The rocks are geological sisters to the Nine Sisters morros.',
  },
  {
    name:'SLO Creek Steelhead Pool',
    category:'nature',
    emoji:'🐟',
    timing:'Winter after rain, morning',
    light:'The creek runs clear after winter storms. Steelhead trout are visible in pools.',
    address:'SLO Creek, Meadow Park, SLO',
    parking:'Meadow Park on Meadow St',
    tips:'Clean creek supports steelhead — a sign of exceptional water quality.',
  },
  {
    name:'El Chorro Hawk Watch',
    category:'nature',
    emoji:'🦅',
    timing:'Late morning when thermals form',
    light:'Red-tailed hawks, kestrels, and white-tailed kites hunt the open grassland.',
    address:'El Chorro Regional Park, SLO',
    parking:'El Chorro park entrance',
    tips:'The ridge above the park is an excellent raptor watching point.',
  },
  {
    name:'Cerro Romauldo Wildflower Slope',
    category:'nature',
    emoji:'🌼',
    timing:'March through April',
    light:'The north-facing slopes stay moist and bloom with mixed wildflowers.',
    address:'Cerro Romauldo Trail, SLO',
    parking:'Trailhead on Hwy 1 near Cal Poly',
    tips:'The most underrated wildflower spot in SLO. Almost no one goes here.',
  },
  {
    name:'Chumash Peak Lichen Rocks',
    category:'nature',
    emoji:'🪨',
    timing:'Overcast days for saturated color',
    light:'The volcanic rocks are covered in orange and grey lichen that glow on cloudy days.',
    address:'Chumash Peak Trail, SLO',
    parking:'Trailhead off Foothill Blvd',
    tips:'Overcast light is actually ideal for lichen photography.',
  },
  {
    name:'SLO Botanical Garden Native Bees',
    category:'nature',
    emoji:'🐝',
    timing:'Mid-morning when flowers are open',
    light:'The native plant garden attracts a remarkable diversity of native bee species.',
    address:'SLO Botanical Garden, SLO',
    parking:'El Chorro Park road',
    tips:'A macro lens reveals details invisible to the naked eye.',
  },
  {
    name:'Johnson Ranch Grassland',
    category:'nature',
    emoji:'🌿',
    timing:'Early morning or late afternoon',
    light:'Rolling grassland with scattered oaks. Hawks perch on fence posts along the trail.',
    address:'Johnson Ranch Open Space, Hwy 227',
    parking:'Signed lot on Hwy 227',
    tips:'One of the best preserved oak savanna landscapes in SLO County.',
  },
  {
    name:'Islay Creek Riparian Zone',
    category:'nature',
    emoji:'🌿',
    timing:'Morning',
    light:'The creek corridor at the base of Islay Hill supports cottonwoods and willows.',
    address:'Islay Creek Trail, SLO',
    parking:'Tank Farm Rd trailhead',
    tips:'The cottonwoods turn gold in November for a brief window.',
  },
  {
    name:'Cal Poly Horse Unit',
    category:'nature',
    emoji:'🐴',
    timing:'Morning feeding time',
    light:'The working horse unit is visible from the road at feeding time.',
    address:'Horse Unit, Cal Poly campus, SLO',
    parking:'View from Slack St near campus',
    tips:'Cal Poly still runs a full working livestock unit — remarkable for a university.',
  },
  {
    name:'Nine Sisters Panorama from 227',
    category:'nature',
    emoji:'🏔',
    timing:'Morning for clearest air',
    light:'All nine Sisters visible simultaneously from Highway 227 south of SLO.',
    address:'Hwy 227 south of downtown SLO',
    parking:'Pull-outs along Hwy 227',
    tips:'A clear winter morning after rain reveals the full chain with snow on the peaks.',
  },
  {
    name:'Pennington Creek Ferns',
    category:'nature',
    emoji:'🌿',
    timing:'Overcast days',
    light:'The shaded creek supports a lush fern canyon unusual for dry California.',
    address:'Upper Pennington Canyon, SLO',
    parking:'Trailhead off Prefumo Canyon Rd',
    tips:'Only accessible after wet winters when the creek is flowing fully.',
  },
  {
    name:'SLO Creek Duck Families',
    category:'nature',
    emoji:'🦆',
    timing:'Spring — March through May',
    light:'Mallard families with ducklings use the downtown creek stretch.',
    address:'SLO Creek at Mission Plaza',
    parking:'Downtown parking',
    tips:'The Mission Plaza section of the creek is the most accessible for duck photography.',
  },
  {
    name:'Bishop Peak Peregrine Watch',
    category:'nature',
    emoji:'🦅',
    timing:'Spring nesting season — March through June',
    light:'Peregrine falcons nest on the volcanic rock faces of Bishop Peak.',
    address:'Bishop Peak upper slopes, SLO',
    parking:'Bishop Peak trailhead',
    tips:'A 400mm+ lens reveals the nest site on the south face. Do not approach.',
  },
  {
    name:'Cerro San Luis Morning Fog',
    category:'nature',
    emoji:'🌫',
    timing:'Winter mornings after cold nights',
    light:'The mountain emerges from the marine layer like an island above clouds.',
    address:'View from downtown SLO looking west',
    parking:'Any downtown street with a clear westward view',
    tips:'The fog burns off quickly. Be there before 9am in winter.',
  },
  {
    name:'Irish Hills Spring Poppies',
    category:'nature',
    emoji:'🌺',
    timing:'March through April',
    light:'California poppies dot the south-facing slopes in a good wildflower year.',
    address:'Irish Hills Natural Reserve, SLO',
    parking:'Los Osos Valley Rd trailhead',
    tips:'South-facing slopes get the most sun and bloom earliest.',
  },
  {
    name:'Poly Creek Amphibians',
    category:'nature',
    emoji:'🐸',
    timing:'Winter and spring after rain',
    light:'Pacific tree frogs and California newts emerge in Poly Creek after rain.',
    address:'Poly Creek, Cal Poly campus, SLO',
    parking:'Campus creek access near the ag unit',
    tips:'A macro lens at water level reveals the amphibians in their element.',
  },
  {
    name:'Cuesta Grade Oak Woodland',
    category:'nature',
    emoji:'🌳',
    timing:'October for fall color',
    light:'The blue oaks along the Cuesta Grade briefly show color in October.',
    address:'Cuesta Grade, US-101, SLO',
    parking:'Small pull-outs along the grade',
    tips:'California oaks do not turn brilliant colors but the muted gold is beautiful.',
  },
  {
    name:'SLO Greenbelt at Dusk',
    category:'nature',
    emoji:'🌿',
    timing:'Late afternoon',
    light:'The Greenbelt trail system connects the hills to the valley floor through native habitat.',
    address:'Greenbelt Trailhead, Bello St, SLO',
    parking:'Bello St parking area',
    tips:'Local deer, foxes, and coyotes use this corridor. Early morning for wildlife.',
  },
  {
    name:'Tank Farm Creek Willows',
    category:'nature',
    emoji:'🌿',
    timing:'Spring — new growth',
    light:'Willow trees along Tank Farm Creek flush with vivid new green in early spring.',
    address:'Tank Farm Creek, SLO',
    parking:'Tank Farm Rd, near Broad St',
    tips:'The willows are the first splash of green in SLO after winter dormancy.',
  },
  {
    name:'Prefumo Canyon Monarch Roost',
    category:'nature',
    emoji:'🦋',
    timing:'October through February',
    light:'Monarch butterflies roost in Prefumo Canyon eucalyptus on their migration.',
    address:'Prefumo Canyon Rd, SLO',
    parking:'Street parking on Prefumo Canyon Rd',
    tips:'Less visited than Pismo. Look for orange clusters on the eucalyptus branches.',
  },
  {
    name:'SLO Creek at Mission Plaza',
    category:'nature',
    emoji:'🌊',
    timing:'Morning or Thursday evening',
    light:'The restored creek flows clear through downtown. Ducks, herons, and steelhead visible.',
    address:'Mission Plaza, SLO',
    parking:'Downtown parking',
    tips:'The creek was restored from a concrete channel. A conservation success story worth documenting.',
  },
  {
    name:'Mission San Luis Obispo de Tolosa',
    category:'architecture',
    emoji:'⛪',
    timing:'30 min before sunset',
    light:'The Mission facade faces southwest. Perfect warm light at dusk year-round.',
    address:'Mission Plaza, Chorro St, SLO',
    parking:'Palm St garage — free after 5pm',
    tips:'The creek and plaza foreground adds depth. Thursdays add Farmers Market energy.',
  },
  {
    name:'Fremont Theater Neon at Dusk',
    category:'architecture',
    emoji:'🎭',
    timing:'Blue hour — 10-20 min after sunset',
    light:'The neon glows best when the sky still has color but the sign is fully lit.',
    address:'1025 Monterey St, SLO',
    parking:'Street parking on Monterey or Palm St garage',
    tips:'Portrait orientation captures the full vertical marquee. Stand across the street.',
  },
  {
    name:'Ah Louis Store on Palm Street',
    category:'architecture',
    emoji:'🏮',
    timing:'Morning for east-facing light',
    light:'The red brick and historic lanterns photograph beautifully in clean morning light.',
    address:'800 Palm St, SLO',
    parking:'Palm St garage nearby',
    tips:'One of the few 19th century buildings remaining in SLO. Read the history first.',
  },
  {
    name:'Lizzie Street Victorian District',
    category:'architecture',
    emoji:'🏠',
    timing:'Afternoon for west-facing facades',
    light:'Two blocks of beautifully preserved Victorians from the 1880s and 1890s.',
    address:'Lizzie St, SLO',
    parking:'Street parking on Lizzie St',
    tips:'The houses are private residences — shoot from the sidewalk.',
  },
  {
    name:'SLO Courthouse Mural Staircase',
    category:'architecture',
    emoji:'🏛',
    timing:'Mid-morning for even light',
    light:'The interior mural staircase is one of the most photographed interiors in SLO.',
    address:'SLO County Courthouse, Monterey St',
    parking:'Street parking on Monterey St',
    tips:'The courthouse is open during business hours. The mural wraps around the stairwell.',
  },
  {
    name:'Downtown Higuera Street',
    category:'architecture',
    emoji:'🏙',
    timing:'Thursday Farmers Market night',
    light:'Five blocks of the street close to cars and fill with lights, food, and people.',
    address:'Higuera St, Downtown SLO',
    parking:'Any downtown garage',
    tips:'The energy and light of the Farmers Market at night is uniquely SLO.',
  },
  {
    name:'Cal Poly Architecture Building',
    category:'architecture',
    emoji:'🏗',
    timing:'Midday for modern geometry',
    light:'The Architecture and Environmental Design building is a study in California Modernism.',
    address:'Cal Poly Campus, Grand Ave, SLO',
    parking:'Cal Poly visitor parking',
    tips:'The building itself is the portfolio. Worth photographing as architecture.',
  },
  {
    name:'Poly Canyon Design Village',
    category:'architecture',
    emoji:'🏗',
    timing:'Mid-morning for even canyon light',
    light:'Student-built experimental structures in a hidden canyon. No two alike.',
    address:'Poly Canyon Rd, Cal Poly, SLO',
    parking:'Cal Poly visitor lots',
    tips:'Each structure was designed and built by architecture students. Completely unique.',
  },
  {
    name:'SLO Train Station',
    category:'architecture',
    emoji:'🚂',
    timing:'Early morning or when Amtrak arrives',
    light:'The 1894 railroad depot is one of the finest surviving examples of its era on the Coast.',
    address:'1011 Railroad St, SLO',
    parking:'Station parking lot — free',
    tips:'The station comes alive when the Coast Starlight or Pacific Surfliner arrives.',
  },
  {
    name:'Granada Hotel Facade',
    category:'architecture',
    emoji:'🏨',
    timing:'Morning for east-facing light',
    light:'The restored 1920s facade is one of the most photogenic buildings on Monterey St.',
    address:'1126 Monterey St, SLO',
    parking:'Street parking on Monterey',
    tips:'The hotel is beautifully maintained. The vintage signage is exceptional.',
  },
  {
    name:'SLO Farmers Market Thursday Night',
    category:'architecture',
    emoji:'🌃',
    timing:'6-9pm every Thursday',
    light:'Five blocks of Higuera with string lights, fire pits, and the whole city gathered.',
    address:'Higuera St, Downtown SLO',
    parking:'Any downtown garage or lot',
    tips:'Wide angle at street level captures the energy. Telephoto compresses the crowd.',
  },
  {
    name:'Mission Plaza Fountain at Night',
    category:'architecture',
    emoji:'🌃',
    timing:'After dark',
    light:'The fountain is lit at night and reflects the Mission tower beautifully.',
    address:'Mission Plaza, Chorro St, SLO',
    parking:'Downtown parking',
    tips:'Long exposure of the fountain creates a smooth water effect.',
  },
  {
    name:'SLO Carnegie Library Building',
    category:'architecture',
    emoji:'🏛',
    timing:'Morning',
    light:'The original 1905 Carnegie library building is now the History Center. Classic Beaux Arts.',
    address:'696 Monterey St, SLO',
    parking:'Street parking on Monterey',
    tips:'One of 63 Carnegie libraries built in California. Beautifully preserved.',
  },
  {
    name:'Bubblegum Alley Detail',
    category:'architecture',
    emoji:'🎨',
    timing:'Any time — natural light best',
    light:'The walls of gum are a textural marvel. Details reveal hidden art within.',
    address:'Bubblegum Alley, 733 Higuera St, SLO',
    parking:'Street level — no parking needed',
    tips:'Close-up macro photography reveals faces, messages, and art within the layers.',
  },
  {
    name:'Palm Street Commercial Block',
    category:'architecture',
    emoji:'🏙',
    timing:'Morning for east light',
    light:'The Victorian commercial block on Palm St is one of the most intact 19th century streetscapes in SLO.',
    address:'700 block Palm St, SLO',
    parking:'Palm St garage',
    tips:'The block has barely changed since the 1890s. Look for the period details.',
  },
  {
    name:'SLO City Hall',
    category:'architecture',
    emoji:'🏛',
    timing:'Morning',
    light:'The Mission Revival city hall building dates to 1941 and anchors the civic center.',
    address:'990 Palm St, SLO',
    parking:'City Hall lot or street parking',
    tips:'Pair with the courthouse and Carnegie Library for a civic architecture walk.',
  },
  {
    name:'Jack House Victorian Garden',
    category:'architecture',
    emoji:'🏡',
    timing:'Afternoon for garden light',
    light:'The preserved Victorian garden is lush and photogenic in afternoon light.',
    address:'536 Marsh St, SLO',
    parking:'Street parking on Marsh St',
    tips:'The garden is open to the public. The house is one of the oldest in SLO.',
  },
  {
    name:'Cal Poly Crops Unit Fields',
    category:'architecture',
    emoji:'🌾',
    timing:'Early morning or golden hour',
    light:'The working farm fields create geometric patterns when viewed from above or at ground level.',
    address:'Cal Poly Farm, Grand Ave, SLO',
    parking:'Campus road access',
    tips:'The crops change seasonally — something different to photograph every few months.',
  },
  {
    name:'Miossi Adobe Ruins',
    category:'hidden',
    emoji:'🏚',
    timing:'Morning for raking light on adobe',
    light:'One of the oldest standing adobe structures in SLO. Almost nobody visits.',
    address:'Upper SLO hillside — research location',
    parking:'Research exact address before going',
    tips:'The adobe ruins date to the early mission era. Fragile — photograph only.',
  },
  {
    name:'Dry Creek Road Eucalyptus',
    category:'hidden',
    emoji:'🌲',
    timing:'Morning fog or late afternoon',
    light:'A long avenue of massive eucalyptus trees creates a tunnel effect.',
    address:'Dry Creek Rd, SLO',
    parking:'Street parking along Dry Creek Rd',
    tips:'The trees were planted over a century ago. The scale is extraordinary.',
  },
  {
    name:'Perfumo Canyon Hidden Waterfall',
    category:'hidden',
    emoji:'💧',
    timing:'Winter after heavy rain only',
    light:'A seasonal waterfall appears in Prefumo Canyon after significant rainfall.',
    address:'Prefumo Canyon Rd upper sections, SLO',
    parking:'Limited roadside parking on Prefumo Canyon Rd',
    tips:'Only flows after significant rain. Check after a series of storm systems.',
  },
  {
    name:'Old Mission Cemetery',
    category:'hidden',
    emoji:'⛪',
    timing:'Morning for soft light',
    light:'The original mission burial ground. Some headstones date to the 1780s.',
    address:'Behind Mission San Luis Obispo, SLO',
    parking:'Mission Plaza parking',
    tips:'The carved stonework on the oldest markers is extraordinary. Be respectful.',
  },
  {
    name:'Cal Poly Serenity Swing',
    category:'hidden',
    emoji:'🌅',
    timing:'Sunrise or sunset',
    light:'A hidden swing on a hilltop above campus with panoramic views of SLO.',
    address:'Upper Cal Poly campus — ask students for directions',
    parking:'Campus parking lots',
    tips:'Few visitors know about this. The view is exceptional and the spot is genuinely peaceful.',
  },
  {
    name:'Stenner Canyon Creek',
    category:'hidden',
    emoji:'💧',
    timing:'Spring after rain',
    light:'A hidden creek canyon runs through a shaded ravine north of campus.',
    address:'Stenner Creek Rd, SLO',
    parking:'Street parking near campus north entrance',
    tips:'The creek runs clear and clean. Ferns and moss line the banks in wet years.',
  },
  {
    name:'SLO Railroad Water Tower',
    category:'hidden',
    emoji:'🏗',
    timing:'Morning for east-facing light',
    light:'A historic railroad water tower near the depot is one of the last in SLO County.',
    address:'Near Railroad St, SLO',
    parking:'Station area parking',
    tips:'A remnant of the railroad era. The weathered wood and iron rings are highly textural.',
  },
  {
    name:'Dallidet Adobe Garden',
    category:'hidden',
    emoji:'🌿',
    timing:'Afternoon',
    light:'A beautifully preserved 1853 adobe with a lush working garden open to the public.',
    address:'1185 Pacific St, SLO',
    parking:'Street parking on Pacific St',
    tips:'Free to visit. Almost always deserted. The garden is immaculately maintained.',
  },
  {
    name:'SLO Creek Source at Highland',
    category:'hidden',
    emoji:'💧',
    timing:'Morning',
    light:'The headwaters of SLO Creek emerge from springs in the upper hills. Rarely visited.',
    address:'Highland Dr area, SLO',
    parking:'Residential street parking',
    tips:'Following the creek from its source to downtown is a remarkable photographic project.',
  },
  {
    name:'Foothill Road Walnut Trees',
    category:'hidden',
    emoji:'🌳',
    timing:'October for brief gold color',
    light:'A row of old English walnut trees turns briefly gold in October.',
    address:'Foothill Rd near Tank Farm, SLO',
    parking:'Street parking along Foothill Rd',
    tips:'Walnut orchards once covered this part of SLO. These are remnants of that era.',
  },
  {
    name:'Upper Higuera Light Industrial',
    category:'hidden',
    emoji:'🏭',
    timing:'Early morning',
    light:'The working light industrial area of upper Higuera has an unexpected gritty photogenic character.',
    address:'Upper Higuera St, SLO',
    parking:'Street parking on upper Higuera',
    tips:'Delivery trucks, loading docks, and working businesses. Classic documentary photography.',
  },
  {
    name:'SLO Airport Approach Path',
    category:'hidden',
    emoji:'✈️',
    timing:'When arrivals are scheduled',
    light:'Planes on final approach to SLO airport pass remarkably low over the south end of town.',
    address:'Tank Farm Rd near airport approach, SLO',
    parking:'Pull-outs on Tank Farm Rd',
    tips:'Check the SLO airport arrivals board. A telephoto catches the planes against the Sisters.',
  },
  {
    name:'Thursday Farmers Market Vendors',
    category:'food',
    emoji:'🥕',
    timing:'6-8pm Thursdays',
    light:'The vendors, produce, and crowd at the weekly market is world class street photography.',
    address:'Higuera St, Downtown SLO',
    parking:'Any downtown garage',
    tips:'The light from food stalls and fire pits creates a warm, lively atmosphere.',
  },
  {
    name:'Libertine Brewing Wild Ale Pours',
    category:'food',
    emoji:'🍺',
    timing:'Any time during service',
    light:'The moody industrial taproom with its dramatic bar setup photographs beautifully.',
    address:'1234 Broad St, SLO',
    parking:'Street parking on Broad St',
    tips:'The tap handles, barrel room, and pours are all worth shooting. Ask permission first.',
  },
  {
    name:'SLO Brew Rock Concert Crowd',
    category:'food',
    emoji:'🎵',
    timing:'During shows — evening',
    light:'The converted industrial space with dramatic lighting and a live crowd.',
    address:'855 Aerovista Pl, SLO',
    parking:'Venue parking lot',
    tips:'Concert photography rules apply. Check with the venue before shooting.',
  },
  {
    name:'Creamery Marketplace Exterior',
    category:'food',
    emoji:'🏪',
    timing:'Morning for east-facing light',
    light:'The restored 1905 creamery building is one of the most distinctive commercial buildings in SLO.',
    address:'570 Higuera St, SLO',
    parking:'Creamery parking lot',
    tips:'The industrial heritage of the building contrasts beautifully with the boutique shops inside.',
  },
  {
    name:'McConnell Ice Cream Line',
    category:'food',
    emoji:'🍦',
    timing:'Saturday afternoon — peak line',
    light:'The line around the block on a busy Saturday is a uniquely SLO slice of life.',
    address:'893 Higuera St, SLO',
    parking:'Street parking on Higuera',
    tips:'The pastel colors, happy people, and downtown backdrop make this a feel-good shot.',
  },
  {
    name:'Novo Creekside Patio',
    category:'food',
    emoji:'🌿',
    timing:'Lunch or early dinner service',
    light:'The creekside dining patio is one of the most beautiful restaurant settings in the county.',
    address:'726 Higuera St, SLO',
    parking:'Downtown parking',
    tips:'The creek, the oaks, and the string lights at dusk are exceptional. Book a table.',
  },
  {
    name:'Downtown Wine Walk Tasting Rooms',
    category:'food',
    emoji:'🍷',
    timing:'Late afternoon tasting hours',
    light:'The intimate tasting rooms along the downtown wine walk are moody and photogenic.',
    address:'Duncan Alley and Higuera St, SLO',
    parking:'Downtown parking',
    tips:'Croma Vera in Duncan Alley has particularly beautiful interior light.',
  },
  {
    name:'Cal Poly Creamery Ice Cream Window',
    category:'food',
    emoji:'🍨',
    timing:'After 11am when open',
    light:'The on-campus creamery window is quintessential Cal Poly.',
    address:'Cal Poly Farm Store, Grand Ave',
    parking:'Campus visitor parking',
    tips:'The hand-lettered signs and farm context make this a distinctive food photo.',
  },
  {
    name:'SLO Farmers Market Kettle Corn',
    category:'food',
    emoji:'🍿',
    timing:'Thursday evenings',
    light:'The kettle corn operation has been a Farmers Market institution for decades.',
    address:'Higuera St, Downtown SLO',
    parking:'Downtown parking',
    tips:'The steam, the vendor, and the crowd make this a classic market shot.',
  },
  {
    name:'Sally Loos Wholesome Cafe Interior',
    category:'food',
    emoji:'☕',
    timing:'Morning service hours',
    light:'The cozy neighborhood cafe has warm, inviting interior light and a loyal local crowd.',
    address:'1804 Osos St, SLO',
    parking:'Street parking on Osos St',
    tips:'The morning light through the east windows is exceptional. Arrive early.',
  },
  {
    name:'Reservoir Canyon Super Bloom',
    category:'seasonal',
    emoji:'🌸',
    timing:'March-May after wet winter',
    light:'The canyon hillsides turn purple-blue with lupine in exceptional wildflower years.',
    address:'Reservoir Canyon Rd, SLO',
    parking:'Canyon entrance small lot',
    tips:'A wet winter guarantees an exceptional bloom. Check local Instagram for timing.',
  },
  {
    name:'Irish Hills Poppy Fields',
    category:'seasonal',
    emoji:'🌺',
    timing:'March-April',
    light:'California poppies light up the south-facing slopes on warm spring days.',
    address:'Irish Hills Natural Reserve, SLO',
    parking:'Los Osos Valley Rd trailhead',
    tips:'Poppies open in full sun and close at dusk. Shoot at midday for fully open flowers.',
  },
  {
    name:'Downtown SLO Christmas Lights',
    category:'seasonal',
    emoji:'🎄',
    timing:'December evenings',
    light:'The downtown trees are strung with lights that turn Higuera into a festive corridor.',
    address:'Higuera St, Downtown SLO',
    parking:'Downtown parking',
    tips:'Long exposure at night captures the light trails from passing cars against the Christmas trees.',
  },
  {
    name:'Cerro San Luis Morning Fog Bank',
    category:'seasonal',
    emoji:'🌫',
    timing:'Winter mornings',
    light:'The mountain rises above a sea of marine fog. The city disappears below the clouds.',
    address:'Any downtown high point or hilltop, SLO',
    parking:'Hilltop access varies',
    tips:'The fog burns off by 10am. This shot requires being in position before sunrise.',
  },
  {
    name:'SLO Creek Winter Flow',
    category:'seasonal',
    emoji:'💧',
    timing:'December through March after rain',
    light:'The creek runs full and powerful after winter storms. Waterfalls appear at the rock drops.',
    address:'SLO Creek at Mission Plaza',
    parking:'Downtown parking',
    tips:'Long exposure at 1/4 second smooths the water. Use the footbridge for a stable base.',
  },
  {
    name:'Cal Poly Graduation Day',
    category:'seasonal',
    emoji:'🎓',
    timing:'June graduation weekend',
    light:'The campus transforms. Families, regalia, and genuine joy everywhere.',
    address:'Cal Poly campus, SLO',
    parking:'Campus parking — arrive very early',
    tips:'Document the human moments rather than the ceremony itself.',
  },
  {
    name:'Nine Sisters with Snow Caps',
    category:'seasonal',
    emoji:'❄️',
    timing:'After winter storms — rare',
    light:'In rare cold storms, the morros dust with snow. A genuinely unusual sight.',
    address:'Any point with clear view of the Sisters, SLO',
    parking:'Various viewpoints downtown',
    tips:'Snow on the morros lasts hours, not days. Be ready when storms clear.',
  },
  {
    name:'Prefumo Canyon Monarch Peak',
    category:'seasonal',
    emoji:'🦋',
    timing:'Late November through January',
    light:'Hundreds of monarchs cluster in the eucalyptus. Orange and black against grey branches.',
    address:'Prefumo Canyon Rd, SLO',
    parking:'Street parking on Prefumo Canyon Rd',
    tips:'A 200mm lens lets you frame individual butterflies without disturbing the roost.',
  },
  {
    name:'SLO Mardi Gras Parade',
    category:'seasonal',
    emoji:'🎭',
    timing:'February — Fat Tuesday',
    light:'The biggest Mardi Gras parade outside New Orleans. Downtown SLO goes unhinged.',
    address:'Downtown Higuera St, SLO',
    parking:'Any downtown parking, arrive early',
    tips:'The costumes, floats, and crowd energy make for exceptional photojournalism.',
  },
  {
    name:'Edna Valley Harvest',
    category:'seasonal',
    emoji:'🍇',
    timing:'September-October',
    light:'The harvest transforms the valley. Bins of grapes, harvesters at work, and golden vines.',
    address:'Edna Valley wineries, SLO',
    parking:'Winery parking lots',
    tips:'Ask permission before shooting harvest operations. Most wineries say yes enthusiastically.',
  },
  {
    name:'SLO Creek Storm Surge',
    category:'seasonal',
    emoji:'🌊',
    timing:'During and after major storms',
    light:'Winter storms turn the creek into a powerful torrent. The Mission Plaza crossing is dramatic.',
    address:'Mission Plaza creek crossing, SLO',
    parking:'Downtown parking',
    tips:'Safety first — do not enter the creek or cross barriers. Shoot from the footbridge.',
  },
  {
    name:'Islay Hill Wildflower Carpet',
    category:'seasonal',
    emoji:'🌼',
    timing:'March-May in wet years',
    light:'The short grassland on Islay Hill covers with tiny wildflowers in good years.',
    address:'Islay Hill Open Space, SLO',
    parking:'Tank Farm Rd trailhead',
    tips:'Get low for a ground-level shot with the Sisters in the background.',
  },
  {
    name:'Laguna Lake Fall Reflections',
    category:'seasonal',
    emoji:'🍂',
    timing:'October-November',
    light:'The few deciduous trees around the lake briefly reflect color in the still water.',
    address:'Laguna Lake Park, SLO',
    parking:'Park lot — free',
    tips:'The reflections are best in the first hour of morning when the water is still.',
  },
  {
    name:'SLO Night Sky from Irish Hills',
    category:'seasonal',
    emoji:'🌟',
    timing:'New moon nights, winter',
    light:'The Irish Hills are dark enough for Milky Way photography on moonless nights.',
    address:'Irish Hills Natural Reserve, SLO',
    parking:'Los Osos Valley Rd trailhead — arrive before dark',
    tips:'A wide angle lens at f/2.8, ISO 3200, 20 seconds. The Sisters silhouette against the stars.',
  },
  {
    name:'Cal Poly Open House Science Fair',
    category:'seasonal',
    emoji:'🔬',
    timing:'Annual spring Open House',
    light:'Students demonstrate projects across every department. Unique behind-the-scenes access.',
    address:'Cal Poly campus, SLO',
    parking:'Open House parking lots',
    tips:'The engineering and ag demonstrations are particularly photogenic. Free to attend.',
  },
];
var _slCat = 'all';

function openShotList() {
  var existing = document.getElementById('mh-shotlist-hub');
  if (existing) existing.remove();

  if (!document.getElementById('shotlist-css')) {
    var s = document.createElement('style');
    s.id = 'shotlist-css';
    s.textContent = [
      '.sl-filter{padding:6px 12px;border-radius:20px;border:1px solid rgba(236,72,153,0.2);background:transparent;color:rgba(255,255,255,0.4);font-size:11px;font-weight:700;cursor:pointer;white-space:nowrap;flex-shrink:0;font-family:Helvetica Neue,sans-serif;transition:all 0.15s}',
      '.sl-filter.active{background:rgba(236,72,153,0.12);border-color:#ec4899;color:#ec4899}',
      '.sl-card{padding:14px;border-radius:14px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);margin-bottom:10px;cursor:pointer;-webkit-tap-highlight-color:transparent;transition:all 0.15s}',
      '.sl-card:active{transform:scale(0.98);background:rgba(236,72,153,0.04)}',
    ].join('');
    document.head.appendChild(s);
  }

  _slCat = 'all';
  var hub = document.createElement('div');
  hub.id = 'mh-shotlist-hub';
  hub.style.cssText = 'position:fixed;inset:0;z-index:10000;display:flex;flex-direction:column;background:rgba(6,6,15,0.97);backdrop-filter:blur(8px);opacity:0;transition:opacity 0.3s';

  hub.innerHTML =
    '<div style="padding:52px 20px 0;flex-shrink:0;background:linear-gradient(180deg,rgba(236,72,153,0.06) 0%,transparent 100%)">' +
      '<div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">' +
        '<button onclick="closeShotList()" style="background:rgba(255,255,255,0.08);border:none;color:white;width:36px;height:36px;border-radius:50%;font-size:16px;cursor:pointer;flex-shrink:0">←</button>' +
        '<div style="flex:1">' +
          '<div style="font-size:20px;font-weight:900;font-family:Georgia,serif">📸 SLO Shot List</div>' +
          '<div style="font-size:11px;color:rgba(255,255,255,0.4)">100 photo spots · Light · Timing · Tips</div>' +
        '</div>' +
        '<button onclick="closeShotList()" style="background:rgba(255,255,255,0.08);border:none;color:rgba(255,255,255,0.5);width:32px;height:32px;border-radius:50%;font-size:15px;cursor:pointer">✕</button>' +
      '</div>' +
      '<div style="display:flex;gap:5px;overflow-x:auto;scrollbar-width:none;padding-bottom:12px">' +
        SHOT_CATS.map(function(c, i) {
          return '<button class="sl-filter' + (i===0?' active':'') + '" data-slcat="' + c.id + '" onclick="slSetCat(this,this.dataset.slcat)">' + c.emoji + ' ' + c.label + '</button>';
        }).join('') +
      '</div>' +
    '</div>' +
    '<div id="sl-content" style="flex:1;overflow-y:auto;padding:12px 20px 80px">' +
      slRenderList('all') +
    '</div>';

  getHubParent().appendChild(hub);
  setTimeout(function() { hub.style.opacity = '1'; }, 30);
  tipsInjectButton('shot_list');
}
window.openShotList = openShotList;
window.menuHomeOpenShotList = openShotList;

function closeShotList() {
  hubDeactivateMapMode();
  tipsRemoveButton('shot_list');
  var h = document.getElementById('mh-shotlist-hub');
  if (h) { h.style.opacity = '0'; h.style.pointerEvents = 'none'; setTimeout(function() { h.remove(); }, 300); }
}
window.closeShotList = closeShotList;

function slSetCat(el, cat) {
  _slCat = cat;
  document.querySelectorAll('.sl-filter').forEach(function(b) { b.classList.remove('active'); });
  el.classList.add('active');
  var c = document.getElementById('sl-content');
  if (c) c.innerHTML = slRenderList(cat);
}
window.slSetCat = slSetCat;

function slRenderList(cat) {
  var spots = cat === 'all' ? SHOT_SPOTS : SHOT_SPOTS.filter(function(s) { return s.category === cat; });
  var count = spots.length;
  return '<div style="font-size:11px;color:rgba(255,255,255,0.3);margin-bottom:10px">' + count + ' spots</div>' +
    spots.map(function(spot) {
      return '<div class="sl-card" data-slname="' + spot.name.replace(/'/g,"&#39;") + '" onclick="slOpenSpot(this.dataset.slname)">' +
        '<div style="display:flex;gap:12px;align-items:flex-start">' +
          '<div style="font-size:28px;flex-shrink:0;line-height:1;margin-top:2px">' + spot.emoji + '</div>' +
          '<div style="flex:1;min-width:0">' +
            '<div style="font-size:13px;font-weight:800;margin-bottom:3px">' + spot.name + '</div>' +
            '<div style="font-size:11px;color:rgba(236,72,153,0.8);font-weight:700;margin-bottom:3px">⏰ ' + spot.timing + '</div>' +
            '<div style="font-size:11px;color:rgba(255,255,255,0.4);line-height:1.4">' + spot.tips.substring(0,65) + '...' + '</div>' +
          '</div>' +
          '<div style="font-size:14px;color:rgba(236,72,153,0.5);flex-shrink:0;margin-top:4px">›</div>' +
        '</div>' +
      '</div>';
    }).join('');
}

function slOpenSpot(name) {
  var spot = SHOT_SPOTS.find(function(s) { return s.name === name; });
  if (!spot) return;
  var c = document.getElementById('sl-content');
  if (!c) return;
  c.scrollTop = 0;
  c.innerHTML =
    '<button onclick="slBackToList()" style="display:flex;align-items:center;gap:6px;background:none;border:none;color:rgba(255,255,255,0.4);font-size:12px;font-weight:700;cursor:pointer;font-family:Helvetica Neue,sans-serif;padding:0;margin-bottom:16px">← All spots</button>' +
    '<div style="font-size:40px;margin-bottom:8px">' + spot.emoji + '</div>' +
    '<div style="font-size:20px;font-weight:900;font-family:Georgia,serif;margin-bottom:12px">' + spot.name + '</div>' +
    '<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:14px">' +
      '<div style="padding:11px;border-radius:12px;background:rgba(236,72,153,0.06);border:1px solid rgba(236,72,153,0.2)">' +
        '<div style="font-size:10px;color:#ec4899;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">Best Time</div>' +
        '<div style="font-size:12px;color:rgba(255,255,255,0.7);line-height:1.4">' + spot.timing + '</div>' +
      '</div>' +
      '<div style="padding:11px;border-radius:12px;background:rgba(255,215,0,0.06);border:1px solid rgba(255,215,0,0.2)">' +
        '<div style="font-size:10px;color:#ffd700;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px">Light</div>' +
        '<div style="font-size:12px;color:rgba(255,255,255,0.7);line-height:1.4">' + spot.light + '</div>' +
      '</div>' +
    '</div>' +
    '<div style="padding:13px;border-radius:13px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.07);margin-bottom:10px">' +
      '<div style="font-size:11px;font-weight:700;color:rgba(255,255,255,0.4);margin-bottom:6px">💡 Photographer Tips</div>' +
      '<div style="font-size:13px;color:rgba(255,255,255,0.65);line-height:1.6">' + spot.tips + '</div>' +
    '</div>' +
    '<div style="padding:13px;border-radius:13px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.07);margin-bottom:12px">' +
      '<div style="font-size:11px;font-weight:700;color:rgba(255,255,255,0.4);margin-bottom:6px">🅿️ Parking</div>' +
      '<div style="font-size:13px;color:rgba(255,255,255,0.55);line-height:1.5">' + spot.parking + '</div>' +
    '</div>' +
    '<a href="https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(spot.address) + '" target="_blank" style="display:block;padding:12px;border-radius:12px;background:rgba(236,72,153,0.08);border:1px solid rgba(236,72,153,0.25);color:#ec4899;text-align:center;font-size:12px;font-weight:800;text-decoration:none;margin-bottom:16px">📍 Open in Maps ↗</a>' +
    '<button onclick="slBackToList()" style="width:100%;padding:13px;border-radius:13px;border:1px solid rgba(255,255,255,0.08);background:transparent;color:rgba(255,255,255,0.4);font-size:13px;font-weight:700;cursor:pointer;font-family:Helvetica Neue,sans-serif">← Back to Shot List</button>';
}
window.slOpenSpot = slOpenSpot;

function slBackToList() {
  var c = document.getElementById('sl-content');
  if (c) { c.innerHTML = slRenderList(_slCat); c.scrollTop = 0; }
}
window.slBackToList = slBackToList;
