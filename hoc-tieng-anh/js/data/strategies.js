const STRATS = [
  { id: 's5-scan', part: 5, t: 'Part 5 trong 20 giây mỗi câu', sum: 'Đọc đáp án trước để biết câu hỏi thuộc dạng nào, mỗi dạng có cách giải riêng. Mục tiêu: xong 30 câu Part 5 trong 10 phút.',
    body: [
      'h:Bước 1: nhìn 4 đáp án (2 giây)',
      'li:**Cùng gốc, khác đuôi** (decide, decision, decisive, decisively) → câu từ loại: chỉ cần nhìn vị trí, không cần dịch.',
      'li:**Cùng động từ, khác dạng** (submit, submits, submitted, will submit) → câu thì, bị động, hòa hợp: tìm chủ ngữ và dấu hiệu thời gian.',
      'li:**Đại từ** (they, them, their, themselves) → xác định vai trò.',
      'li:**Liên từ, giới từ** (although, despite, because, due to) → nhìn sau chỗ trống có mệnh đề hay danh từ.',
      'li:**Bốn từ khác nghĩa cùng loại** → câu từ vựng: đọc cả câu, tìm collocation.',
      'h:Bước 2: giải theo dạng',
      'p:Câu từ loại và đại từ: 5–10 giây. Câu thì, liên từ: 15–20 giây. Câu từ vựng: 25–30 giây. Câu nào quá 40 giây thì đoán, đánh dấu, làm tiếp.',
      'tip:Thời gian tiết kiệm ở Part 5–6 dồn cho Part 7. Người đạt 850+ thường xong Part 5–6 trong 15–17 phút.',
      'trap:Đừng dịch từng câu sang tiếng Việt. Thói quen dịch là lý do phổ biến nhất khiến không kịp làm Part 7.'
    ] },
  { id: 's2-trap', part: 2, t: 'Part 2: bắt từ để hỏi, tránh bẫy lặp âm', sum: 'Part 2 có 25 câu và không có chữ trên đề. Chỉ cần bắt được 1–2 từ đầu câu hỏi, rồi loại đáp án bẫy.',
    body: [
      'h:Tập trung vào từ đầu tiên',
      'li:**Where** → nơi chốn (in, at, on the…, next to). **When** → thời gian (at 3, next week, after lunch). **Who** → người, chức vụ, phòng ban. **Why** → lý do (because, to…). **How long/How often/How much** → khoảng thời gian, tần suất, giá.',
      'li:Câu Yes/No (Do you…, Is there…, Have you…) có thể trả lời không có Yes/No.',
      'h:Ba bẫy hay gặp',
      'li:**Lặp âm**: đáp án lặp lại một từ hoặc từ đồng âm của câu hỏi (copy – coffee, meeting – meet) thường là SAI.',
      'li:**Sai loại câu hỏi**: hỏi When mà đáp án trả lời nơi chốn.',
      'li:**Yes/No cho câu hỏi Wh-**: câu hỏi bắt đầu bằng Wh- không thể trả lời bằng Yes hoặc No.',
      'h:Đáp án đúng thường gián tiếp',
      'p:Ở mức 800+, khoảng 30–40% đáp án đúng là câu trả lời **gián tiếp**: *“I\'ll check with my manager.”*, *“It hasn\'t been decided yet.”*, *“Didn\'t you get the e-mail?”*, *“Mr. Kim is in charge of that.”*',
      'ex:When will the new printer be installed? — The technician is coming tomorrow.|Khi nào máy in mới được lắp? — Kỹ thuật viên sẽ đến vào ngày mai (trả lời gián tiếp).',
      'tip:Nghe xong đáp án nào chắc chắn sai thì loại ngay trong đầu (A sai, B có thể, C sai → chọn B).'
    ] },
  { id: 's7-order', part: 7, t: 'Part 7: thứ tự làm và cách quét thông tin', sum: '54 câu trong khoảng 55 phút. Đọc câu hỏi trước, xác định từ khóa, quét văn bản. Dạng NOT và suy luận để sau.',
    body: [
      'h:Quy trình mỗi văn bản',
      'li:Đọc dòng giới thiệu (Questions 147–148 refer to the following **e-mail**) để biết loại văn bản.',
      'li:Đọc **câu hỏi** (chưa đọc đáp án), gạch từ khóa: tên riêng, số, ngày, danh từ đặc biệt.',
      'li:Đọc lướt văn bản tìm từ khóa, rồi đọc kỹ 2–3 câu quanh đó.',
      'li:Đáp án đúng thường **diễn đạt lại** (paraphrase) chứ không lặp nguyên văn: *postponed* → *delayed*, *complimentary* → *free*.',
      'h:Các dạng câu hỏi',
      'tbl:Dạng|Cách làm;Mục đích, ý chính (What is the purpose…?)|Đọc 2–3 câu đầu, đôi khi câu cuối;Chi tiết (What time…, How much…)|Quét từ khóa;NOT true|Đối chiếu từng đáp án với văn bản, làm sau cùng;Suy luận (What is suggested/implied…)|Tìm bằng chứng gián tiếp, không chọn đáp án quá xa văn bản;Từ đồng nghĩa (The word X in line 2 is closest in meaning to)|Thay từng đáp án vào câu, chọn nghĩa hợp ngữ cảnh;Chèn câu|Tìm từ quy chiếu (this, these, also);Ý người viết tin nhắn (What does Ms. X mean when she writes…?)|Đọc câu trước và câu sau tin nhắn đó',
      'tip:Ngân sách thời gian: đoạn đơn 2 câu ~2 phút, 3 câu ~3 phút, 4 câu ~4 phút; đoạn kép ~5 phút; ba đoạn ~6 phút.',
      'trap:Đáp án dùng nguyên từ trong văn bản nhưng sai thông tin là bẫy phổ biến. Kiểm tra cả chủ thể và thời gian.'
    ] },
  { id: 's3-preview', part: 3, t: 'Part 3: đọc trước câu hỏi, nghe theo thứ tự', sum: '13 đoạn hội thoại, mỗi đoạn 3 câu. Dùng 8 giây nghỉ để đọc trước 3 câu hỏi của đoạn tiếp theo.',
    body: [
      'li:Trong lúc máy đọc hướng dẫn và câu hỏi, đọc trước **3 câu hỏi** (không cần đọc đáp án) của đoạn sắp nghe.',
      'li:Thứ tự câu hỏi thường theo thứ tự thông tin trong hội thoại: câu 1 ở đầu, câu 2 ở giữa, câu 3 ở cuối.',
      'li:Gạch chân **ai** được hỏi: *What does the **man** suggest?* → nghe lời người đàn ông.',
      'h:Câu hỏi hay gặp',
      'li:Đầu hội thoại: chủ đề, mục đích, nơi làm việc, nghề nghiệp của người nói.',
      'li:Giữa: vấn đề, lý do, chi tiết (giá, thời gian, số lượng).',
      'li:Cuối: người nói sẽ làm gì tiếp (*What will the woman probably do next?*), đề nghị, yêu cầu.',
      'li:**Hàm ý** (*What does the man mean when he says, "…"?*): hiểu tình huống quanh câu đó, không dịch từng chữ.',
      'li:**Biểu đồ** (*Look at the graphic*): liên hệ thông tin nghe được với bảng. Đáp án là thông tin **không** được nói trực tiếp mà phải tra từ bảng.',
      'tip:Trả lời xong câu 3 là chuyển ngay sang đọc trước đoạn sau, không tiếc câu đã lỡ.'
    ] },
  { id: 's1-photo', part: 1, t: 'Part 1: tả người, tả vật và bẫy động từ', sum: '6 câu dễ nhất đề, cần đúng cả 6. Bẫy chủ yếu nằm ở động từ và ở thể bị động tiếp diễn.',
    body: [
      'li:Trước khi nghe, nhìn tranh và tự hỏi: **ai** đang **làm gì**, **vật gì** ở **đâu**.',
      'li:Tranh có người: chú ý hành động chính (typing, pointing, carrying, reaching for, examining).',
      'li:Tranh không người: đáp án thường dùng bị động hoàn thành: *Chairs **have been arranged** in rows*, *Some boxes **have been stacked***.',
      'trap:*is being + V3* (đang được làm) chỉ đúng khi trong tranh **có người đang làm** việc đó. Tranh bàn ghế không người mà nghe *Chairs are being stacked* → sai.',
      'trap:Vật có trong tranh nhưng động từ sai: tranh có cái thang, đáp án *He is climbing the ladder* sai nếu người đó chỉ đứng cạnh thang.',
      'li:Từ dễ gặp: *stack, pile, line up, lean against, hang, face, overlook, be propped against, be displayed, be stocked, be unoccupied*.'
    ] },
  { id: 's6-context', part: 6, t: 'Part 6: đọc cả đoạn, không chỉ câu có chỗ trống', sum: '4 đoạn, mỗi đoạn 4 câu: 3 câu điền từ và 1 câu điền cả câu. Thì và từ nối phụ thuộc vào câu trước và câu sau.',
    body: [
      'li:Đọc nhanh tiêu đề và câu đầu để biết bối cảnh (thông báo, email, quảng cáo).',
      'li:Câu hỏi **thì**: kiểm tra thời điểm của sự việc trong toàn đoạn (đã xảy ra, sắp xảy ra). Ví dụ email nói về sự kiện *next month* → dùng tương lai.',
      'li:Câu hỏi **từ nối** (However, Therefore, In addition): xác định quan hệ giữa câu trước và câu sau.',
      'li:Câu hỏi **từ vựng**: nghĩa phải hợp với cả đoạn.',
      'li:Câu hỏi **chèn câu**: dùng từ quy chiếu và mạch ý (xem bài “Chiến thuật câu chèn câu”).',
      'tip:Đọc cả đoạn một lần (khoảng 40 giây) rồi mới trả lời 4 câu nhanh hơn là giải từng câu.'
    ] },
  { id: 's4-talks', part: 4, t: 'Part 4: nhận diện loại bài nói', sum: '10 bài nói một người. Mỗi loại bài có cấu trúc quen thuộc, biết trước là đoán được thông tin nằm ở đâu.',
    body: [
      'tbl:Loại bài|Thông tin hay hỏi;Tin nhắn thoại (telephone message)|Người gọi là ai, gọi vì sao, yêu cầu người nghe làm gì;Thông báo (announcement) ở sân bay, cửa hàng, công ty|Thay đổi gì, vì sao, người nghe nên làm gì;Quảng cáo (advertisement)|Sản phẩm gì, ưu đãi, cách nhận ưu đãi, thời hạn;Hướng dẫn tham quan (tour)|Đang ở đâu, lịch trình, quy định;Bản tin (news, traffic, weather report)|Sự kiện gì, ảnh hưởng ra sao;Phát biểu, giới thiệu (speech, introduction)|Giới thiệu ai, thành tích, sự kiện gì;Trích đoạn họp (excerpt from a meeting)|Chủ đề, vấn đề, quyết định, việc cần làm',
      'li:Câu đầu tiên của bài thường trả lời câu hỏi “mục đích” hoặc “người nói là ai”.',
      'li:Câu cuối thường chứa yêu cầu (*Please…, Be sure to…, Don\'t forget to…*) → đáp án câu hỏi cuối.',
      'tip:Câu hàm ý ở Part 4 (*Why does the speaker say, "…"?*) thường liên quan tới cảm xúc hoặc mục đích: trấn an, phàn nàn, gợi ý, nhắc nhở.'
    ] },
  { id: 's5-vocab', part: 5, t: 'Part 5: câu từ vựng và collocation', sum: 'Khoảng 1/3 Part 5 là câu từ vựng: bốn đáp án cùng từ loại, khác nghĩa. Muốn 850+ cần nắm collocation, không chỉ nghĩa đơn lẻ.',
    body: [
      'li:Đọc cả câu, tìm **từ đi kèm** chỗ trống: động từ – danh từ (*meet a deadline*), tính từ – giới từ (*eligible for*), trạng từ – động từ (*strongly recommend*).',
      'li:Loại đáp án không hợp với giới từ phía sau: *responsible **for***, *aware **of***, *comply **with***.',
      'li:Học từ theo cụm trong ngữ cảnh (mỗi thẻ từ trong app đều có câu ví dụ công sở).',
      'tbl:Cụm trạng từ + động từ hay gặp|Nghĩa;strongly recommend / encourage|rất khuyến khích;highly recommended / qualified|rất được đánh giá cao, rất đủ năng lực;carefully review / examine|xem xét kỹ;promptly respond / reply|phản hồi nhanh;temporarily closed / unavailable|tạm đóng, tạm không có;newly renovated / hired|mới cải tạo, mới tuyển;fully booked / refundable|kín chỗ, hoàn tiền toàn bộ;widely used / available|được dùng rộng rãi',
      'tip:Khi không chắc, chọn đáp án tạo thành cụm quen thuộc nhất trong môi trường công sở.'
    ] },
  { id: 's2-indirect', part: 2, t: 'Part 2: câu hỏi đuôi, câu đề nghị, câu trần thuật', sum: 'Ba dạng khó nhất Part 2 với người hướng tới 850+. Câu trả lời đúng hầu như luôn gián tiếp.',
    body: [
      'li:**Câu đề nghị** (Why don\'t we…? Would you like…? Could you…?) → chấp nhận hoặc từ chối: *That\'s a good idea.*, *Sure, I\'ll do it after lunch.*, *I\'m afraid I\'m busy.*',
      'li:**Câu hỏi đuôi** (…, isn\'t it? …, didn\'t you?) → trả lời như câu Yes/No về sự việc: *The report is due today, isn\'t it?* — *Actually, it\'s due tomorrow.*',
      'li:**Câu trần thuật** (I can\'t find my keys.) → đáp án là phản ứng hợp lý: *Did you check your desk?*',
      'li:**Câu hỏi lựa chọn** (A or B?) → chọn một, cả hai, không cái nào, hoặc *Whichever is cheaper.*',
      'ex:Should we order lunch for the meeting? — Ms. Lee already took care of that.|Có nên đặt bữa trưa cho cuộc họp không? — Cô Lee đã lo rồi.'
    ] },
  { id: 's7-multi', part: 7, t: 'Part 7: đoạn kép và đoạn ba', sum: '25 câu cuối đề, 5 câu mỗi bộ. Luôn có 1–2 câu phải kết hợp thông tin từ hai văn bản.',
    body: [
      'li:Đọc tên và loại của từng văn bản (email, lịch trình, phiếu đặt hàng, đánh giá) để biết chúng liên quan thế nào.',
      'li:Câu hỏi 1–2 của bộ thường hỏi văn bản thứ nhất, câu cuối thường hỏi văn bản cuối.',
      'li:**Câu liên kết**: thông tin “cầu nối” thường là tên người, ngày, mã đơn hàng, giá, phòng. Ví dụ email nói *I booked the cheapest room*, bảng giá cho biết phòng rẻ nhất là *Standard* → đáp án *Standard room*.',
      'tip:Khi gặp câu hỏi có tên riêng hoặc con số mà một văn bản không đủ thông tin, lập tức tìm văn bản còn lại.',
      'trap:Đáp án có thông tin đúng ở văn bản này nhưng câu hỏi đang hỏi về văn bản khác.'
    ] },
  { id: 's3-graphic', part: 3, t: 'Part 3–4: câu hỏi biểu đồ', sum: 'Khoảng 5 câu mỗi đề. Nhìn biểu đồ trước khi nghe để biết cột nào chứa đáp án, cột nào chứa thông tin sẽ được nói.',
    body: [
      'li:Đáp án A–D nằm ở một cột của bảng (ví dụ tên phòng). Thông tin được **nói trong bài** nằm ở cột còn lại (ví dụ giờ họp).',
      'li:Vì vậy khi nghe, tập trung vào cột **không** phải đáp án.',
      'ex:Look at the graphic. Which room will the meeting be held in? (Bảng: Room A – 9:00, Room B – 11:00…) → nghe giờ họp *11 o\'clock* để suy ra *Room B*.|Nghe thông tin ở cột giờ, chọn đáp án ở cột phòng.',
      'tip:Biểu đồ hay gặp: lịch trình, bảng giá, sơ đồ tầng, dự báo thời tiết, phiếu giảm giá, biểu đồ cột.'
    ] },
  { id: 's6-time', part: 6, t: 'Quản lý 75 phút Reading', sum: 'Phân bổ thời gian là thứ quyết định giữa 750 và 850. Không để trống câu nào.',
    body: [
      'tbl:Part|Số câu|Thời gian mục tiêu;Part 5|30|10–12 phút;Part 6|16|7–8 phút;Part 7 đoạn đơn|29|25 phút;Part 7 đoạn kép, ba|25|25–28 phút;Dò lại|—|còn lại',
      'li:Nhìn đồng hồ ở mốc câu 147 (đầu Part 7): lý tưởng còn 55 phút.',
      'li:Gặp câu khó, chọn đáp án hợp lý nhất, đánh dấu và làm tiếp. Quay lại nếu còn thời gian.',
      'li:5 phút cuối: tô hết các câu còn trống, TOEIC không trừ điểm câu sai.',
      'tip:Trong app, chế độ “Như thi thật” có đồng hồ đếm ngược và tự nộp bài khi hết giờ. Luyện ít nhất 2 đề đầy đủ trước ngày thi.'
    ] },
  { id: 's4-paraphrase', part: 4, t: 'Nghe ý, không nghe từ: paraphrase', sum: 'Đáp án đúng ở Part 3–4 hầu như luôn diễn đạt lại lời nói bằng từ khác. Học cách nhận ra các cặp diễn đạt tương đương.',
    body: [
      'tbl:Trong bài nghe|Trong đáp án;The flight has been pushed back.|The flight is delayed.;It\'s free of charge.|It is complimentary.;I\'ll e-mail you the details.|Send some information.;We\'re short-staffed.|There are not enough employees.;The shipment hasn\'t arrived.|An order is late.;Let\'s move the meeting to Friday.|Reschedule a meeting.;Could you look over my slides?|Review a presentation.;The copier is jammed again.|Some equipment is not working.',
      'trap:Đáp án lặp đúng một từ nghe được nhưng sai ý thường là bẫy.',
      'tip:Khi luyện Part 3–4 trong app, sau khi xem đáp án hãy bật lời thoại và tìm câu chứa ý của đáp án đúng để quen với paraphrase.'
    ] },
  { id: 's1-vocab', part: 1, t: 'Từ vựng Part 1 theo chủ đề tranh', sum: 'Nhóm động từ và danh từ hay xuất hiện trong tranh văn phòng, cửa hàng, đường phố, bến cảng.',
    body: [
      'tbl:Bối cảnh|Từ hay gặp;Văn phòng|type on a keyboard, look at a monitor, file documents, make copies, hang a picture, adjust a chair;Cuộc họp|be seated around a table, give a presentation, point at a chart, shake hands, hand out documents;Kho, công trường|stack boxes, load a truck, push a cart, climb a ladder, wear a hard hat;Cửa hàng, nhà hàng|examine merchandise, pay at a register, pour coffee, wipe a counter, be displayed on shelves;Ngoài trời|be parked along the street, cross the street, water plants, sweep the sidewalk, ride a bicycle;Bến tàu|be docked at a pier, board a boat, be tied to a post, overlook the water',
      'tip:Học thành cụm có hình ảnh. Khi làm Part 1 trong app, đọc lại 4 câu mô tả sau khi trả lời để học thêm từ.'
    ] }
];
