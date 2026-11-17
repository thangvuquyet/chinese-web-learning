const GRAMMAR = [
  { id: 'pos', lv: 1, tag: 'wordform', t: 'Từ loại và vị trí trong câu', en: 'Parts of Speech', sum: 'Dạng câu nhiều nhất Part 5 (6–8 câu mỗi đề): bốn đáp án cùng gốc từ, chỉ khác đuôi. Nhìn vị trí chỗ trống là chọn được trong 5 giây.',
    body: [
      'h:Nhận diện bằng đuôi từ',
      'tbl:Loại từ|Đuôi hay gặp|Ví dụ;Danh từ (n)|-tion, -sion, -ment, -ness, -ity, -ance, -ence, -er/-or, -ist, -ship|**decision**, payment, ability, assistance;Động từ (v)|-ize, -ify, -ate, -en|organize, verify, motivate, widen;Tính từ (adj)|-able, -ible, -ive, -ous, -ful, -al, -ic, -ent, -ant, -less|reliable, effective, various, careful;Trạng từ (adv)|-ly (thêm vào tính từ)|**carefully**, quickly, significantly',
      'h:Vị trí quyết định từ loại',
      'li:Sau mạo từ (a, an, the), tính từ sở hữu (his, their, our), giới từ → **danh từ**: *the **approval** of the board*.',
      'li:Giữa mạo từ và danh từ → **tính từ**: *a **reliable** supplier*.',
      'li:Sau động từ to be, become, seem, remain → **tính từ**: *The results were **impressive***.',
      'li:Trước hoặc sau động từ thường, đầu câu trước dấu phẩy, giữa trợ động từ và động từ chính → **trạng từ**: *has **recently** opened*, *will **carefully** review*.',
      'li:Trước tính từ hoặc trạng từ khác → **trạng từ**: ***extremely** busy*, ***relatively** inexpensive*.',
      'li:Sau chủ ngữ, sau will, can, must, to → **động từ**.',
      'ex:Ms. Kim made a **significant** contribution to the project.|Cô Kim đã có đóng góp **đáng kể** cho dự án.',
      'ex:The new system works **efficiently**.|Hệ thống mới vận hành **hiệu quả**.',
      'trap:Danh từ chỉ người và danh từ chỉ việc: *applicant* (người nộp đơn) và *application* (đơn). Chỗ trống sau *an* + hành động nộp → application; sau *the most qualified* → applicant. Đọc nghĩa cả câu.',
      'trap:Danh từ ghép: *a **safety** inspection*, *a **sales** representative*: chỗ trống trước danh từ có thể cần một **danh từ** chứ không phải tính từ.',
      'tip:Quy trình 5 giây: (1) nhìn 4 đáp án thấy cùng gốc → (2) nhìn 1–2 từ trước và sau chỗ trống → (3) chọn từ loại. Không cần dịch cả câu.'
    ],
    quiz: [
      ['The new software allows staff to complete reports more _______.', ['efficient', 'efficiently', 'efficiency', 'efficiencies'], 1, 'Sau động từ *complete reports* và *more* cần **trạng từ** bổ nghĩa cho động từ: more efficiently.', 'wordform'],
      ['Please submit your _______ for the internship by March 15.', ['apply', 'applicable', 'application', 'applied'], 2, 'Sau tính từ sở hữu *your* cần **danh từ**. Application = đơn ứng tuyển (vật được nộp).', 'wordform'],
      ['The board was impressed by the _______ growth of online sales.', ['remark', 'remarkable', 'remarkably', 'remarked'], 1, 'Giữa *the* và danh từ *growth* cần **tính từ**: remarkable growth.', 'wordform'],
      ['Mr. Lee has _______ been promoted to regional director.', ['recent', 'recently', 'recentness', 'more recent'], 1, 'Giữa trợ động từ *has* và *been promoted* cần **trạng từ**: has recently been promoted.', 'wordform'],
      ['Customer feedback on the new menu has been very _______.', ['positive', 'positively', 'positivity', 'positiveness'], 0, 'Sau *has been very* cần **tính từ** làm bổ ngữ: very positive.', 'wordform'],
      ['All employees must complete the safety _______ before using the machines.', ['train', 'trained', 'training', 'trainer'], 2, 'Sau *safety* cần danh từ tạo cụm danh từ ghép *safety training* (khóa đào tạo an toàn). Trainer là người, không hợp nghĩa.', 'wordform'],
      ['The museum is _______ located near the central station.', ['convenience', 'convenient', 'conveniently', 'conveniences'], 2, 'Bổ nghĩa cho phân từ *located* cần **trạng từ**: conveniently located.', 'wordform'],
      ['The _______ of the new factory will create 300 jobs.', ['construct', 'constructive', 'construction', 'constructed'], 2, 'Sau *The* và trước *of* cần **danh từ**: the construction of.', 'wordform']
    ] },
  { id: 'nouns', lv: 1, tag: 'quant', t: 'Danh từ đếm được, không đếm được và lượng từ', en: 'Countable Nouns & Quantifiers', sum: 'Each, every, many, much, few, little, a number of, the amount of… mỗi từ đi với một loại danh từ riêng. Đề hay bẫy ở danh từ không đếm được.',
    body: [
      'h:Danh từ không đếm được hay gặp trong TOEIC',
      'p:**information, equipment, furniture, advice, luggage, baggage, machinery, merchandise, feedback, research, software, staff (tập thể), access, permission, traffic.** Không thêm -s, không đi với a/an.',
      'tbl:Lượng từ|Đi với|Ví dụ;each, every|danh từ đếm được **số ít**|every **employee** has; each **room** includes;many, few, a few, a number of, several, both|danh từ đếm được **số nhiều**|many **applicants**; a number of **complaints**;much, little, a little, a great deal of, the amount of|danh từ **không đếm được**|much **information**; a great deal of **equipment**;all, most, some, any, a lot of, plenty of|cả hai|most **staff**, all **rooms**',
      'li:**a number of** + N số nhiều + động từ số nhiều; **the number of** + N số nhiều + động từ **số ít**.',
      'li:**each of / one of / none of** + the + N số nhiều → động từ chia theo *each/one*: *Each of the rooms **has** a view.*',
      'ex:The number of visitors **has** increased this year.|Số lượng khách tham quan đã tăng trong năm nay.',
      'trap:*Every* và *each* luôn + danh từ số ít, nhưng *all* + số nhiều. *Every applicants* là sai.',
      'trap:*Few* = hầu như không (nghĩa phủ định); *a few* = một vài (nghĩa khẳng định). Câu có nghĩa tích cực thường chọn *a few*.'
    ],
    quiz: [
      ['_______ employee is required to wear an identification badge.', ['All', 'Every', 'Many', 'Most'], 1, '*Employee* là danh từ số ít, chỉ **every** đi được với danh từ đếm được số ít.', 'quant'],
      ['We received a large _______ of information about the new regulations.', ['number', 'amount', 'many', 'several'], 1, '*Information* không đếm được nên dùng **amount**. Number đi với danh từ số nhiều.', 'quant'],
      ['_______ of the candidates has a degree in engineering.', ['Each', 'Every', 'All', 'Both'], 0, '*of the candidates* + động từ *has* (số ít) → **Each of**. Every không đứng trước of.', 'quant'],
      ['The hotel provides _______ useful advice for first-time visitors.', ['many', 'a few', 'much', 'several'], 2, '*Advice* là danh từ không đếm được → **much**.', 'quant'],
      ['A number of customers _______ asked about the new loyalty program.', ['has', 'have', 'is', 'was'], 1, '**A number of** + danh từ số nhiều → động từ số nhiều *have*.', 'agreement'],
      ['Only _______ seats are still available for the evening performance.', ['a little', 'much', 'a few', 'any'], 2, '*Seats* đếm được số nhiều và nghĩa “vẫn còn vài chỗ” → **a few**.', 'quant'],
      ['All new _______ must be tested before it is installed.', ['equipments', 'equipment', 'equip', 'equipping'], 1, '*Equipment* không đếm được, không thêm -s; đại từ *it* cũng cho thấy danh từ số ít.', 'quant']
    ] },
  { id: 'pronouns', lv: 1, tag: 'pronoun', t: 'Đại từ: nhân xưng, sở hữu, phản thân', en: 'Pronouns', sum: 'Phân biệt they – them – their – theirs – themselves. Part 5 luôn có 1–2 câu, chỉ cần xác định vai trò trong câu.',
    body: [
      'tbl:Chủ ngữ|Tân ngữ|Tính từ sở hữu|Đại từ sở hữu|Phản thân;I|me|my|mine|myself;you|you|your|yours|yourself;he|him|his|his|himself;she|her|her|hers|herself;it|it|its|—|itself;we|us|our|ours|ourselves;they|them|their|theirs|themselves',
      'li:**Tính từ sở hữu** + danh từ: *their offices*.',
      'li:**Đại từ sở hữu** đứng một mình thay cho tính từ sở hữu + danh từ: *Our prices are lower than **theirs** (= their prices).*',
      'li:**Phản thân** khi chủ ngữ và tân ngữ là một người, hoặc để nhấn mạnh: *Ms. Diaz designed the logo **herself**.*',
      'li:**by + phản thân** = một mình, tự làm: *He completed the report **by himself**.*',
      'ex:The managers will present their findings themselves.|Các quản lý sẽ tự trình bày kết quả của họ.',
      'trap:*Its* (của nó) khác *it\'s* (= it is). Trước danh từ luôn là *its*.',
      'trap:Sau giới từ dùng tân ngữ: *between you and **me***, *for **them***.'
    ],
    quiz: [
      ['Ms. Patel asked that all reports be sent directly to _______.', ['she', 'her', 'hers', 'herself'], 1, 'Sau giới từ *to* cần **tân ngữ** *her*.', 'pronoun'],
      ['The company celebrated _______ 20th anniversary with a party for all staff.', ['it', "it's", 'its', 'itself'], 2, 'Trước danh từ *anniversary* cần **tính từ sở hữu** *its*.', 'pronoun'],
      ['Our delivery times are faster than _______.', ['their', 'them', 'theirs', 'themselves'], 2, 'Đứng một mình thay cho *their delivery times* → **đại từ sở hữu** theirs.', 'pronoun'],
      ['Mr. Okafor prefers to review contracts _______ before sending them to clients.', ['he', 'his', 'him', 'himself'], 3, 'Nhấn mạnh tự mình làm → **himself**.', 'pronoun'],
      ['Applicants should bring _______ résumés to the interview.', ['they', 'their', 'them', 'theirs'], 1, 'Trước danh từ *résumés* → **their**.', 'pronoun'],
      ['If you have questions about the schedule, please contact Mr. Sato or _______.', ['I', 'me', 'my', 'mine'], 1, 'Làm tân ngữ của *contact* → **me**.', 'pronoun'],
      ['The interns organized the entire event by _______.', ['they', 'their', 'them', 'themselves'], 3, '**by themselves** = tự họ làm, không ai giúp.', 'pronoun']
    ] },
  { id: 'present', lv: 1, tag: 'tense', t: 'Các thì hiện tại', en: 'Present Tenses', sum: 'Hiện tại đơn cho lịch trình và thói quen, tiếp diễn cho việc đang diễn ra, hoàn thành cho kết quả kéo dài tới nay. Nhận diện bằng dấu hiệu thời gian.',
    body: [
      'tbl:Thì|Dấu hiệu|Ví dụ;Hiện tại đơn|every day, usually, always, regularly; lịch trình cố định|The store **opens** at 9 A.M.;Hiện tại tiếp diễn|now, currently, at the moment, this week|We **are currently reviewing** the applications.;Hiện tại hoàn thành|since, for, already, yet, recently, so far, over the past …|Sales **have increased** since January.;Hiện tại hoàn thành tiếp diễn|for, since + nhấn mạnh quá trình|She **has been working** here for ten years.',
      'li:**since** + mốc thời gian (since 2020), **for** + khoảng thời gian (for three years) → hiện tại hoàn thành.',
      'li:**over the past/last + thời gian** → hiện tại hoàn thành.',
      'ex:The train to Boston departs at 7:15 every morning.|Tàu đi Boston khởi hành lúc 7:15 mỗi sáng.',
      'ex:Over the past five years, the company has opened twelve new stores.|Trong 5 năm qua, công ty đã mở 12 cửa hàng mới.',
      'trap:Động từ chỉ trạng thái (know, own, belong, need, contain, prefer) không dùng tiếp diễn: *The box **contains** paper*, không phải *is containing*.'
    ],
    quiz: [
      ['The museum _______ free guided tours every Saturday morning.', ['offer', 'offers', 'is offered', 'have offered'], 1, '*every Saturday* → thói quen, chủ ngữ số ít → **offers**.', 'tense'],
      ['Since joining the firm, Ms. Ruiz _______ three major projects.', ['manages', 'managed', 'has managed', 'is managing'], 2, '*Since* → hiện tại hoàn thành **has managed**.', 'tense'],
      ['The IT team is _______ updating the company Web site.', ['current', 'currently', 'currency', 'currents'], 1, 'Giữa *is* và *updating* cần trạng từ **currently** (dấu hiệu tiếp diễn).', 'adverb'],
      ['Over the past decade, online sales _______ steadily.', ['grow', 'are growing', 'have grown', 'will grow'], 2, '*Over the past decade* → hiện tại hoàn thành **have grown**.', 'tense'],
      ['Mr. Jensen _______ for the company for more than twenty years.', ['works', 'is working', 'has been working', 'worked'], 2, '*for more than twenty years* và vẫn đang làm → **has been working**.', 'tense'],
      ['This package _______ fragile items, so please handle it carefully.', ['contains', 'is containing', 'contain', 'containing'], 0, '*Contain* là động từ trạng thái, không dùng tiếp diễn → **contains**.', 'tense'],
      ['We _______ not yet received the shipment from the supplier.', ['are', 'have', 'do', 'were'], 1, '*not yet received* → hiện tại hoàn thành: **have** not yet received.', 'tense']
    ] },
  { id: 'past', lv: 1, tag: 'tense', t: 'Quá khứ đơn và quá khứ hoàn thành', en: 'Past Tenses', sum: 'Quá khứ đơn cho thời điểm đã xác định (yesterday, last, ago, in 2021). Quá khứ hoàn thành cho việc xảy ra trước một việc khác trong quá khứ.',
    body: [
      'li:**Quá khứ đơn**: yesterday, last week, two days ago, in 2019, when + quá khứ.',
      'li:**Quá khứ hoàn thành** (had + V3): việc xảy ra trước một mốc quá khứ: *By the time the manager arrived, the meeting **had started**.*',
      'li:**Quá khứ tiếp diễn**: việc đang diễn ra thì việc khác xen vào: *I **was preparing** the slides when the power went out.*',
      'ex:The company launched its first product in 2015.|Công ty ra mắt sản phẩm đầu tiên năm 2015.',
      'ex:Before she joined our team, Ms. Lin had worked in Tokyo for five years.|Trước khi vào nhóm, cô Lin đã làm ở Tokyo 5 năm.',
      'trap:*ago* và *last* không đi với hiện tại hoàn thành. *We have met him two days ago* là sai.',
      'trap:*by the time* + quá khứ đơn → mệnh đề chính dùng **quá khứ hoàn thành**; *by the time* + hiện tại → mệnh đề chính dùng **tương lai hoàn thành**.'
    ],
    quiz: [
      ['The marketing team _______ the new campaign two weeks ago.', ['launches', 'has launched', 'launched', 'had launched'], 2, '*two weeks ago* → quá khứ đơn **launched**.', 'tense'],
      ['By the time the technician arrived, the staff _______ the problem themselves.', ['solve', 'have solved', 'had solved', 'were solved'], 2, 'Việc sửa xảy ra trước khi kỹ thuật viên đến → quá khứ hoàn thành **had solved**.', 'tense'],
      ['Ms. Choi _______ a presentation when the fire alarm went off.', ['gives', 'was giving', 'has given', 'had been given'], 1, 'Đang thuyết trình thì chuông reo → quá khứ tiếp diễn **was giving**.', 'tense'],
      ['Last year, the firm _______ its headquarters to Denver.', ['moves', 'moved', 'has moved', 'will move'], 1, '*Last year* → quá khứ đơn **moved**.', 'tense'],
      ['The client _______ already signed the contract before we sent the revised version.', ['has', 'had', 'was', 'have'], 1, 'Ký trước khi gửi bản sửa (cả hai trong quá khứ) → **had** already signed.', 'tense'],
      ['When the store _______ in 1998, it sold only books.', ['opens', 'opened', 'has opened', 'is opened'], 1, '*in 1998* → quá khứ đơn **opened**.', 'tense'],
      ['The shipment _______ on Tuesday, one day earlier than expected.', ['arrive', 'arrives', 'arrived', 'has arrived'], 2, '*on Tuesday* đã qua và *than expected* → quá khứ **arrived**.', 'tense']
    ] },
  { id: 'future', lv: 1, tag: 'tense', t: 'Tương lai và mệnh đề thời gian', en: 'Future & Time Clauses', sum: 'Sau when, once, as soon as, after, before, until, by the time, if dùng hiện tại để nói về tương lai. Đây là bẫy kinh điển của Part 5.',
    body: [
      'li:**will / be going to / hiện tại tiếp diễn** cho kế hoạch tương lai.',
      'li:**Mệnh đề thời gian/điều kiện**: *When the director **arrives**, we **will** start the meeting.* Không dùng *will arrive* sau when.',
      'li:**Tương lai hoàn thành** (will have + V3): xong trước một mốc tương lai, dấu hiệu *by + thời gian tương lai*: *By next March, we **will have opened** five stores.*',
      'li:**Tương lai tiếp diễn**: *This time tomorrow, I **will be flying** to Seoul.*',
      'ex:Please call me as soon as the samples arrive.|Hãy gọi tôi ngay khi mẫu hàng đến.',
      'trap:Câu có *next week, tomorrow, upcoming* mà chỗ trống nằm sau *when, once, as soon as, after, until* → chọn hiện tại đơn.'
    ],
    quiz: [
      ['Once the renovation _______, the restaurant will reopen with a new menu.', ['will finish', 'is finished', 'finished', 'has been finishing'], 1, 'Sau *Once* dùng hiện tại cho tương lai, và renovation được hoàn thành (bị động) → **is finished**.', 'tense'],
      ['By the end of next year, the company _______ over 1,000 employees.', ['hires', 'has hired', 'will have hired', 'hired'], 2, '*By the end of next year* → tương lai hoàn thành **will have hired**.', 'tense'],
      ['Please do not leave the building until the alarm _______.', ['stops', 'will stop', 'stopped', 'is stopping'], 0, 'Sau *until* dùng hiện tại đơn → **stops**.', 'tense'],
      ['The new branch _______ next month in downtown Chicago.', ['opened', 'has opened', 'will open', 'opening'], 2, '*next month* → tương lai **will open**.', 'tense'],
      ['As soon as Mr. Grant _______ the report, he will send it to the board.', ['reviews', 'will review', 'reviewed', 'is reviewed'], 0, 'Sau *As soon as* dùng hiện tại → **reviews**.', 'tense'],
      ['This time next week, our team _______ at the trade fair in Berlin.', ['exhibits', 'will be exhibiting', 'has exhibited', 'exhibited'], 1, '*This time next week* → tương lai tiếp diễn **will be exhibiting**.', 'tense'],
      ['If the weather _______ good, the picnic will be held in the park.', ['will be', 'is', 'was', 'be'], 1, 'Câu điều kiện loại 1: *If* + hiện tại đơn → **is**.', 'cond']
    ] },
  { id: 'agreement', lv: 1, tag: 'agreement', t: 'Hòa hợp chủ ngữ và động từ', en: 'Subject–Verb Agreement', sum: 'Tìm chủ ngữ thật, bỏ qua cụm giới từ và mệnh đề chen giữa. Động từ chia theo chủ ngữ thật.',
    body: [
      'li:Bỏ qua cụm *of…, with…, along with…, as well as…, together with…*: *The **manager**, along with her assistants, **is** attending.*',
      'li:Danh từ không đếm được, danh động từ (V-ing), mệnh đề làm chủ ngữ → số ít: ***Reviewing** the contracts **takes** time.*',
      'li:**either … or / neither … nor** → chia theo chủ ngữ gần động từ nhất.',
      'li:**Each, every, everyone, nobody, something** → số ít.',
      'li:Mệnh đề quan hệ: động từ chia theo danh từ đứng trước *who/which/that*: *Employees **who work** overtime…*',
      'ex:The list of approved suppliers is updated every month.|Danh sách nhà cung cấp được duyệt được cập nhật hằng tháng.',
      'trap:*The list of suppliers*: chủ ngữ là *list* (số ít), không phải *suppliers*.'
    ],
    quiz: [
      ['The results of the customer survey _______ posted on the intranet.', ['has been', 'have been', 'is', 'was'], 1, 'Chủ ngữ thật là *results* (số nhiều) → **have been**.', 'agreement'],
      ['Every member of the sales team _______ a laptop and a phone.', ['receive', 'receives', 'are receiving', 'have received'], 1, '*Every member* → số ít → **receives**.', 'agreement'],
      ['Ms. Diaz, together with two engineers, _______ inspecting the site today.', ['is', 'are', 'were', 'be'], 0, 'Bỏ qua *together with two engineers*, chủ ngữ *Ms. Diaz* số ít → **is**.', 'agreement'],
      ['Neither the manager nor the employees _______ aware of the change.', ['was', 'is', 'were', 'has been'], 2, '*Neither … nor*: chia theo chủ ngữ gần nhất *employees* (số nhiều) → **were**.', 'agreement'],
      ['Updating the client database _______ about three hours.', ['take', 'takes', 'are taking', 'have taken'], 1, 'Chủ ngữ V-ing → số ít → **takes**.', 'agreement'],
      ['The equipment that we ordered last week _______ arrived.', ['have', 'has', 'are', 'were'], 1, '*Equipment* không đếm được, số ít → **has** arrived.', 'agreement'],
      ['Visitors who _______ the factory must wear safety glasses.', ['tours', 'tour', 'touring', 'has toured'], 1, 'Động từ trong mệnh đề quan hệ chia theo *Visitors* (số nhiều) → **tour**.', 'agreement']
    ] },
  { id: 'passive', lv: 1, tag: 'voice', t: 'Câu bị động', en: 'Passive Voice', sum: 'Chủ ngữ không tự làm hành động → bị động (be + V3). Dấu hiệu: không có tân ngữ sau chỗ trống, có "by…".',
    body: [
      'li:Công thức: **be + V3** (is done, was done, has been done, will be done, must be done, is being done).',
      'li:Dấu hiệu chọn bị động: sau chỗ trống **không có tân ngữ**, hoặc có **by + người làm**.',
      'li:Dấu hiệu chọn chủ động: sau chỗ trống **có tân ngữ** (danh từ).',
      'ex:The contract will be signed by both parties tomorrow.|Hợp đồng sẽ được hai bên ký vào ngày mai.',
      'ex:The committee has approved the budget.|Ủy ban đã duyệt ngân sách (chủ động, có tân ngữ *the budget*).',
      'li:Một số động từ thường dùng bị động trong TOEIC: *be located in, be scheduled for, be required to, be expected to, be advised to, be entitled to, be invited to*.',
      'trap:Nội động từ (arrive, occur, happen, rise, remain, appear) **không** có bị động: *The shipment arrived*, không phải *was arrived*.'
    ],
    quiz: [
      ['All visitors _______ to sign in at the front desk.', ['require', 'requires', 'are required', 'requiring'], 2, 'Khách được yêu cầu (không có tân ngữ sau) → bị động **are required**.', 'voice'],
      ['The annual report _______ to shareholders next week.', ['will send', 'will be sent', 'sends', 'is sending'], 1, 'Báo cáo được gửi, có *next week* → **will be sent**.', 'voice'],
      ['Our technicians _______ the air-conditioning system every spring.', ['inspect', 'are inspected', 'inspection', 'be inspected'], 0, 'Có tân ngữ *the air-conditioning system* → chủ động **inspect**.', 'voice'],
      ['The new headquarters is _______ near the river.', ['locate', 'locating', 'located', 'location'], 2, '*be located* = nằm ở. Bị động **located**.', 'voice'],
      ['The problem _______ shortly after the update was installed.', ['was occurred', 'occurred', 'has been occurred', 'occurring'], 1, '*Occur* là nội động từ, không có bị động → **occurred**.', 'voice'],
      ['The conference room is currently _______ for the board meeting.', ['prepare', 'preparing', 'being prepared', 'prepared by'], 2, 'Đang được chuẩn bị → bị động tiếp diễn **being prepared**.', 'voice'],
      ['Ms. Hall _______ as head of the design department last month.', ['appointed', 'was appointed', 'has appointed', 'appoints'], 1, 'Cô Hall được bổ nhiệm, không có tân ngữ → **was appointed**.', 'voice']
    ] },
  { id: 'gerund', lv: 2, tag: 'gerund', t: 'To V hay V-ing', en: 'Gerunds & Infinitives', sum: 'Mỗi động từ đi với một dạng cố định. Thuộc nhóm hay ra là chọn đúng ngay.',
    body: [
      'tbl:Theo sau là|Động từ hay gặp;**V-ing**|avoid, consider, recommend, suggest, finish, postpone, delay, mind, enjoy, keep, involve, include, discuss, practice, deny, risk;**to V**|plan, decide, agree, hope, expect, intend, aim, offer, refuse, fail, afford, manage, promise, seek, strive, hesitate;**tân ngữ + to V**|ask, allow, enable, encourage, require, remind, invite, advise, permit, urge, persuade',
      'li:Sau **giới từ** luôn là V-ing: *interested in **joining**, before **leaving**, instead of **calling***.',
      'li:**look forward to, be committed to, be dedicated to, object to, be used to** → to ở đây là giới từ → **V-ing**: *We look forward to **meeting** you.*',
      'li:**in order to / so as to + V** chỉ mục đích.',
      'ex:The manager suggested postponing the launch.|Quản lý đề nghị hoãn buổi ra mắt.',
      'ex:The new software enables staff to work remotely.|Phần mềm mới cho phép nhân viên làm việc từ xa.',
      'trap:*be committed to* + **V-ing**: *We are committed to **providing** quality service*, không phải *to provide*.'
    ],
    quiz: [
      ['The committee decided _______ the proposal until more data is available.', ['postpone', 'to postpone', 'postponing', 'postponed'], 1, '*decide* + **to V**.', 'gerund'],
      ['We look forward to _______ with your company again.', ['work', 'worked', 'working', 'be working'], 2, '*look forward to* + **V-ing**.', 'gerund'],
      ['The consultant recommended _______ the old printers.', ['replace', 'to replace', 'replacing', 'replaced'], 2, '*recommend* + **V-ing**.', 'gerund'],
      ['The new policy allows employees _______ from home twice a week.', ['work', 'to work', 'working', 'worked'], 1, '*allow* + tân ngữ + **to V**.', 'gerund'],
      ['Before _______ the building, please return your visitor badge.', ['leave', 'to leave', 'leaving', 'left'], 2, 'Sau giới từ *Before* → **V-ing**.', 'gerund'],
      ['Our company is committed to _______ its carbon emissions.', ['reduce', 'reducing', 'reduced', 'reduces'], 1, '*be committed to* + **V-ing**.', 'gerund'],
      ['Ms. Tan managed _______ the report before the deadline.', ['finish', 'finishing', 'to finish', 'finished'], 2, '*manage* + **to V**.', 'gerund'],
      ['Please avoid _______ personal calls during business hours.', ['make', 'to make', 'making', 'made'], 2, '*avoid* + **V-ing**.', 'gerund']
    ] },
  { id: 'participle', lv: 2, tag: 'participle', t: 'Phân từ: V-ing và V-ed', en: 'Participles', sum: 'V-ing mang nghĩa chủ động (gây ra), V-ed mang nghĩa bị động (chịu tác động). Áp dụng cho tính từ và mệnh đề rút gọn.',
    body: [
      'li:Tính từ: *an **interesting** presentation* (bài gây hứng thú) – *the **interested** audience* (khán giả cảm thấy hứng thú).',
      'li:**Rút gọn mệnh đề quan hệ**: *Employees **working** overtime* (= who work) – *the report **submitted** yesterday* (= which was submitted).',
      'li:**Mệnh đề trạng ngữ rút gọn**: ***Having finished** the report, she left.* – ***Founded** in 1990, the firm now has 500 staff.*',
      'li:Phân từ hay gặp: *attached file, enclosed document, revised schedule, updated list, experienced staff, qualified applicants, leading company, existing customers, remaining items, increasing demand*.',
      'ex:Please review the attached document before the meeting.|Vui lòng xem tài liệu đính kèm trước cuộc họp.',
      'ex:Customers purchasing two items will receive a discount.|Khách mua hai món sẽ được giảm giá.',
      'trap:Phân từ đầu câu phải có cùng chủ ngữ với mệnh đề chính. Nếu chủ ngữ tự làm → V-ing; nếu bị tác động → V-ed.'
    ],
    quiz: [
      ['Please find the _______ invoice for last month\'s services.', ['attach', 'attaching', 'attached', 'attachment'], 2, 'Hóa đơn được đính kèm → phân từ bị động **attached**.', 'participle'],
      ['Applicants _______ more than five years of experience are preferred.', ['have', 'having', 'had', 'to have'], 1, 'Rút gọn của *who have* → **having**.', 'participle'],
      ['The _______ schedule will be distributed this afternoon.', ['revise', 'revising', 'revised', 'revision'], 2, 'Lịch được sửa → **revised**.', 'participle'],
      ['_______ in 1987, the company now operates in thirty countries.', ['Found', 'Founding', 'Founded', 'To found'], 2, 'Công ty được thành lập → **Founded** (bị động).', 'participle'],
      ['The results of the study were very _______.', ['encourage', 'encouraged', 'encouraging', 'encouragement'], 2, 'Kết quả gây khích lệ (tác động lên người khác) → **encouraging**.', 'participle'],
      ['Items _______ online can be returned to any of our stores.', ['purchase', 'purchasing', 'purchased', 'purchases'], 2, 'Hàng được mua → rút gọn bị động **purchased**.', 'participle'],
      ['The _______ demand for electric cars has surprised analysts.', ['increase', 'increasing', 'increased by', 'increasingly'], 1, 'Nhu cầu đang tăng → **increasing** demand.', 'participle']
    ] },
  { id: 'relative', lv: 2, tag: 'relative', t: 'Mệnh đề quan hệ', en: 'Relative Clauses', sum: 'Who cho người, which cho vật, whose cho sở hữu, whom làm tân ngữ, where cho nơi chốn. Nhìn từ đứng ngay sau chỗ trống.',
    body: [
      'tbl:Đại từ|Thay cho|Ngay sau là;who|người (chủ ngữ)|động từ: *the woman **who** manages*;whom|người (tân ngữ)|chủ ngữ + động từ: *the client **whom** we met*;which|vật|động từ hoặc chủ ngữ;that|người, vật (không sau dấu phẩy)|như who/which;whose|sở hữu|danh từ: *the firm **whose** products*;where|nơi chốn|câu đầy đủ: *the city **where** we live*;when|thời gian|câu đầy đủ',
      'li:Sau dấu phẩy không dùng *that*.',
      'li:Giới từ + which/whom: *the person **to whom** you spoke*, *the reason **for which***.',
      'li:**whose + danh từ**: dấu hiệu chắc chắn nhất, chỗ trống đứng ngay trước danh từ không có mạo từ.',
      'ex:Applicants whose forms are incomplete will not be considered.|Ứng viên có hồ sơ chưa đầy đủ sẽ không được xét.',
      'trap:*where* phải theo sau là câu đầy đủ. Nếu sau chỗ trống là động từ thiếu chủ ngữ → *which/that*: *the building **which** houses our office*.'
    ],
    quiz: [
      ['The award goes to the employee _______ ideas saved the company the most money.', ['who', 'whom', 'whose', 'which'], 2, 'Ngay sau là danh từ *ideas* → sở hữu **whose**.', 'relative'],
      ['Ms. Ford, _______ has worked here for ten years, will lead the team.', ['that', 'who', 'whom', 'which'], 1, 'Chỉ người, làm chủ ngữ của *has worked*, sau dấu phẩy → **who**.', 'relative'],
      ['The hotel _______ the conference will be held has a large ballroom.', ['which', 'where', 'whose', 'what'], 1, 'Sau chỗ trống là câu đầy đủ *the conference will be held* và chỉ nơi chốn → **where**.', 'relative'],
      ['The software, _______ was released last month, has already been updated.', ['that', 'which', 'who', 'what'], 1, 'Chỉ vật, sau dấu phẩy không dùng that → **which**.', 'relative'],
      ['The client _______ we met yesterday wants to sign the contract.', ['whom', 'whose', 'which', 'where'], 0, 'Chỉ người làm tân ngữ của *met* → **whom**.', 'relative'],
      ['This is the building _______ houses our main research laboratory.', ['where', 'that', 'who', 'whose'], 1, 'Sau chỗ trống là động từ *houses* (thiếu chủ ngữ) → **that**, không dùng where.', 'relative'],
      ['The manager to _______ you should send the form is Ms. Wu.', ['who', 'whom', 'whose', 'that'], 1, 'Sau giới từ *to* dùng **whom**.', 'relative']
    ] },
  { id: 'conjprep', lv: 2, tag: 'conj', t: 'Liên từ hay giới từ', en: 'Conjunctions vs Prepositions', sum: 'Bẫy số 1 của người học 700+: sau liên từ là mệnh đề (có động từ chia), sau giới từ là danh từ hoặc V-ing.',
    body: [
      'tbl:Ý nghĩa|Liên từ (+ mệnh đề)|Giới từ (+ danh từ, V-ing);Nhượng bộ|although, though, even though, while|despite, in spite of, notwithstanding;Nguyên nhân|because, since, as, now that|because of, due to, owing to, on account of;Thời gian|while, when, before, after, until, once|during, before, after, until, prior to, throughout;Điều kiện|if, unless, provided that, as long as, in case|in case of, in the event of;Mục đích|so that, in order that|in order to + V, for',
      'li:Nhìn sau chỗ trống: có **chủ ngữ + động từ chia** → liên từ; chỉ có **danh từ/cụm danh từ** → giới từ.',
      'ex:Although the weather was bad, the event was a success.|Mặc dù thời tiết xấu, sự kiện vẫn thành công.',
      'ex:Despite the bad weather, the event was a success.|Bất chấp thời tiết xấu, sự kiện vẫn thành công.',
      'trap:*during* chỉ đi với danh từ (during the meeting), *while* đi với mệnh đề hoặc V-ing (while I was waiting / while waiting).',
      'trap:*unless* = if not. Câu đã có *unless* thì vế sau không thêm *not* nữa.'
    ],
    quiz: [
      ['_______ the high cost, the board approved the new equipment.', ['Although', 'Despite', 'Because', 'Even if'], 1, 'Sau chỗ trống là cụm danh từ *the high cost* → giới từ **Despite**.', 'conj'],
      ['The flight was canceled _______ the pilots went on strike.', ['due to', 'because', 'despite', 'during'], 1, 'Sau chỗ trống là mệnh đề *the pilots went on strike* → liên từ **because**.', 'conj'],
      ['Phones must be turned off _______ the performance.', ['while', 'during', 'when', 'as'], 1, '*the performance* là danh từ → **during**.', 'conj'],
      ['_______ sales were lower than expected, the company still made a profit.', ['Despite', 'In spite of', 'Although', 'Because of'], 2, 'Sau chỗ trống là mệnh đề → liên từ nhượng bộ **Although**.', 'conj'],
      ['You will not receive a refund _______ you return the item within 30 days.', ['if', 'unless', 'despite', 'so that'], 1, 'Nghĩa: không được hoàn tiền nếu không trả trong 30 ngày → **unless**.', 'conj'],
      ['The road was closed _______ heavy snow.', ['because', 'owing to', 'although', 'since'], 1, '*heavy snow* là danh từ → giới từ **owing to**.', 'conj'],
      ['Please arrive early _______ we can start the meeting on time.', ['so that', 'in order to', 'because of', 'even though'], 0, 'Sau chỗ trống là mệnh đề chỉ mục đích → **so that**.', 'conj'],
      ['The museum will remain open _______ the renovation work is being done.', ['during', 'while', 'throughout', 'despite'], 1, 'Sau chỗ trống là mệnh đề có động từ → **while**.', 'conj']
    ] },
  { id: 'correlative', lv: 2, tag: 'conj', t: 'Liên từ cặp và liên từ nối', en: 'Correlative & Coordinating Conjunctions', sum: 'Both … and, either … or, neither … nor, not only … but also, whether … or. Thấy một vế là đoán được vế kia.',
    body: [
      'tbl:Cặp|Nghĩa;both A and B|cả A và B;either A or B|A hoặc B;neither A nor B|không A cũng không B;not only A but (also) B|không những A mà còn B;whether A or B|liệu A hay B;between A and B|giữa A và B',
      'li:A và B phải cùng dạng (song song): *both **quick** and **reliable***.',
      'li:**and, but, or, so, yet** nối hai thành phần cùng loại.',
      'ex:The package can be delivered either on Friday or on Monday.|Gói hàng có thể giao vào thứ Sáu hoặc thứ Hai.',
      'trap:*neither* đi với *nor*, không đi với *or*. *either* đi với *or*.'
    ],
    quiz: [
      ['The new printer is both faster _______ quieter than the old one.', ['or', 'nor', 'and', 'but'], 2, '*both … and*.', 'conj'],
      ['Neither the manager _______ her assistant was available.', ['or', 'nor', 'and', 'but'], 1, '*neither … nor*.', 'conj'],
      ['Customers can pay _______ by credit card or by bank transfer.', ['either', 'neither', 'both', 'whether'], 0, '*either … or*.', 'conj'],
      ['The program is not only affordable _______ also easy to use.', ['and', 'but', 'or', 'so'], 1, '*not only … but also*.', 'conj'],
      ['We have not decided _______ to hold the event indoors or outdoors.', ['if', 'whether', 'either', 'that'], 1, '*whether … or* + to V.', 'conj'],
      ['The workshop is short, _______ it covers all the key topics.', ['so', 'or', 'yet', 'nor'], 2, 'Ý đối lập (ngắn nhưng đủ) → **yet**.', 'conj']
    ] },
  { id: 'prep', lv: 2, tag: 'prep', t: 'Giới từ thời gian và nơi chốn', en: 'Prepositions of Time & Place', sum: 'In, on, at, by, until, within, for, since, throughout… Mỗi đề có 2–3 câu giới từ.',
    body: [
      'tbl:Giới từ|Dùng với|Ví dụ;at|giờ, địa điểm cụ thể|at 9 A.M., at the front desk;on|ngày, thứ, bề mặt|on Monday, on May 5, on the second floor;in|tháng, năm, mùa, không gian bên trong|in June, in 2026, in the lobby;by|trước hoặc muộn nhất là|submit **by** Friday;until|kéo dài đến|stay open **until** 10 P.M.;within|trong vòng (giới hạn)|within 30 days, within walking distance;for|trong khoảng|for two weeks;throughout|suốt|throughout the year, throughout the country;between … and|giữa|between 2 and 4 P.M.;from … to|từ … đến|from Monday to Friday',
      'li:**by** = hạn chót (hành động xong trước mốc). **until** = trạng thái kéo dài tới mốc.',
      'li:Vị trí: next to, across from, opposite, behind, in front of, among (nhiều), between (hai), along, near, beside.',
      'ex:The report must be submitted by noon on Friday.|Báo cáo phải nộp trước trưa thứ Sáu.',
      'trap:*within* hay đi với khoảng thời gian/khoảng cách: *within two business days*, *within the city limits*.'
    ],
    quiz: [
      ['All entries must be received _______ May 31.', ['until', 'by', 'in', 'within'], 1, 'Hạn chót (nhận được trước mốc) → **by**.', 'prep'],
      ['The pharmacy is open _______ 8 A.M. to 9 P.M.', ['between', 'from', 'since', 'at'], 1, '*from … to*.', 'prep'],
      ['Refunds will be issued _______ ten business days.', ['within', 'by', 'until', 'at'], 0, 'Trong vòng một khoảng thời gian → **within**.', 'prep'],
      ['The festival takes place _______ the summer months.', ['on', 'at', 'throughout', 'by'], 2, 'Suốt cả mùa hè → **throughout**.', 'prep'],
      ['The library will be closed _______ further notice.', ['by', 'until', 'since', 'within'], 1, '*until further notice* = cho đến khi có thông báo mới.', 'prep'],
      ['The meeting room is located _______ the third floor.', ['in', 'at', 'on', 'by'], 2, 'Tầng → **on** the third floor.', 'prep'],
      ['The new store is _______ walking distance of the train station.', ['within', 'among', 'between', 'during'], 0, '*within walking distance of* = đi bộ được tới.', 'prep']
    ] },
  { id: 'prepphrase', lv: 3, tag: 'colloc', t: 'Giới từ đi kèm và cụm cố định', en: 'Fixed Prepositional Phrases', sum: 'Responsible for, eligible for, in charge of, on behalf of, in accordance with… Phải thuộc cụm, không suy luận được.',
    body: [
      'tbl:Nhóm|Cụm hay gặp;Tính từ + giới từ|responsible **for**, eligible **for**, aware **of**, capable **of**, familiar **with**, compatible **with**, comparable **to**, subject **to**, accessible **to**, interested **in**, dependent **on**;Động từ + giới từ|comply **with**, apply **for**, account **for**, consist **of**, rely **on**, depend **on**, participate **in**, specialize **in**, refer **to**, respond **to**, contribute **to**, register **for**;Cụm giới từ|in charge of, on behalf of, in accordance with, in response to, in addition to, according to, with regard to, as a result of, in favor of, on account of, ahead of, in advance, at no cost, on time, in time',
      'ex:Ms. Lin is in charge of the hiring process.|Cô Lin phụ trách quy trình tuyển dụng.',
      'ex:Prices are subject to change without notice.|Giá có thể thay đổi mà không báo trước.',
      'trap:*on time* = đúng giờ; *in time* = kịp lúc (trước khi quá muộn).'
    ],
    quiz: [
      ['Employees are responsible _______ keeping their work areas clean.', ['to', 'for', 'of', 'with'], 1, '*responsible for*.', 'colloc'],
      ['All products must comply _______ national safety standards.', ['to', 'by', 'with', 'for'], 2, '*comply with*.', 'colloc'],
      ['Prices listed in the catalog are subject _______ change.', ['for', 'with', 'to', 'on'], 2, '*be subject to* = có thể bị.', 'colloc'],
      ['I am writing _______ behalf of the entire design team.', ['in', 'at', 'on', 'by'], 2, '*on behalf of*.', 'colloc'],
      ['The tour package consists _______ three nights in Rome and two in Florence.', ['in', 'of', 'with', 'from'], 1, '*consist of*.', 'colloc'],
      ['Ms. Abe is familiar _______ the new accounting software.', ['with', 'to', 'for', 'about'], 0, '*familiar with*.', 'colloc'],
      ['_______ to the forecast, sales will rise next quarter.', ['Due', 'According', 'Owing', 'Prior'], 1, '*According to* = theo như.', 'colloc']
    ] },
  { id: 'compare', lv: 2, tag: 'compare', t: 'So sánh hơn, nhất và bằng', en: 'Comparisons', sum: 'Nhìn từ báo hiệu: than → so sánh hơn; the … of/in → nhất; as … as → bằng. Đề hay cho đáp án là các dạng của cùng một tính từ.',
    body: [
      'li:**So sánh hơn**: adj-er / more adj + **than**. Bổ nghĩa: *much, far, even, significantly, considerably* + so sánh hơn.',
      'li:**So sánh nhất**: the adj-est / the most adj + **of/in/among/ever**.',
      'li:**So sánh bằng**: as adj/adv **as**; *twice as … as*.',
      'li:**The + so sánh hơn, the + so sánh hơn**: *The sooner you apply, the better your chances.*',
      'ex:This model is considerably lighter than the previous one.|Mẫu này nhẹ hơn đáng kể so với mẫu trước.',
      'ex:It was the most successful campaign in the company\'s history.|Đó là chiến dịch thành công nhất lịch sử công ty.',
      'trap:*very* không bổ nghĩa cho so sánh hơn. *very cheaper* sai, phải là *much cheaper*.',
      'trap:Sau *as … as* là dạng nguyên: *as **quickly** as possible*.'
    ],
    quiz: [
      ['The new office is much _______ than the old one.', ['spacious', 'more spacious', 'most spacious', 'spaciously'], 1, '*much … than* → so sánh hơn **more spacious**.', 'compare'],
      ['This is the _______ hotel in the downtown area.', ['more luxurious', 'luxurious', 'most luxurious', 'luxuriously'], 2, '*the … in the downtown area* → so sánh nhất **most luxurious**.', 'compare'],
      ['Please send the documents as _______ as possible.', ['quick', 'quickly', 'quicker', 'quickest'], 1, '*as … as* bổ nghĩa cho động từ *send* → trạng từ dạng nguyên **quickly**.', 'compare'],
      ['The _______ you register, the better the discount you will receive.', ['early', 'earlier', 'earliest', 'more early'], 1, '*The + so sánh hơn, the + so sánh hơn* → **earlier**.', 'compare'],
      ['Our new laptop is _______ lighter than competing models.', ['very', 'significantly', 'most', 'more'], 1, 'Bổ nghĩa cho so sánh hơn *lighter* → **significantly** (không dùng very).', 'compare'],
      ['Ms. Reyes is the _______ of the three candidates.', ['qualified', 'more qualified', 'most qualified', 'qualifying'], 2, '*the … of the three* → so sánh nhất **most qualified**.', 'compare'],
      ['This year\'s revenue is twice as _______ as last year\'s.', ['high', 'higher', 'highest', 'highly'], 0, '*twice as … as* + tính từ nguyên dạng **high**.', 'compare']
    ] },
  { id: 'adverbs', lv: 2, tag: 'adverb', t: 'Trạng từ và vị trí của chúng', en: 'Adverbs', sum: 'Already, still, yet, soon, nearly, only, hardly, shortly, recently, highly… Nhiều trạng từ có nghĩa khác với tính từ gốc.',
    body: [
      'li:**already** (đã, khẳng định), **yet** (chưa, cuối câu phủ định/nghi vấn), **still** (vẫn còn).',
      'li:**hard** (chăm chỉ) khác **hardly** (hầu như không); **late** (muộn) khác **lately** (gần đây); **high** khác **highly** (rất: highly recommended); **near** khác **nearly** (gần như); **short** khác **shortly** (sắp, ngay sau: shortly after).',
      'li:Trạng từ bổ nghĩa cả câu đứng đầu: *Unfortunately, …; Additionally, …; Alternatively, …*',
      'li:Trạng từ chỉ mức độ trước tính từ: *extremely, relatively, highly, fully, reasonably, exceptionally*.',
      'ex:The new manager is highly experienced.|Quản lý mới rất giàu kinh nghiệm.',
      'ex:The CEO will arrive shortly.|Tổng giám đốc sẽ đến ngay.',
      'trap:*hardly* đã mang nghĩa phủ định, không thêm *not*.'
    ],
    quiz: [
      ['The results will be announced _______ after the meeting.', ['short', 'shortly', 'shortness', 'shorten'], 1, '*shortly after* = ngay sau khi.', 'adverb'],
      ['Ms. Bell is _______ recommended by her previous employer.', ['high', 'higher', 'highly', 'height'], 2, '*highly recommended* = được đánh giá rất cao.', 'adverb'],
      ['The client has not _______ approved the final design.', ['already', 'still', 'yet', 'soon'], 2, 'Câu phủ định hiện tại hoàn thành → **yet**.', 'adverb'],
      ['There was _______ any time left to ask questions.', ['hard', 'hardly', 'harder', 'hardest'], 1, '*hardly any* = hầu như không có.', 'adverb'],
      ['The repairs are _______ complete; only the painting remains.', ['near', 'nearly', 'nearest', 'nearer'], 1, '*nearly complete* = gần xong.', 'adverb'],
      ['_______, the flight to Paris has been canceled.', ['Unfortunate', 'Unfortunately', 'Fortune', 'Unfortunateness'], 1, 'Trạng từ bổ nghĩa cả câu, đứng đầu trước dấu phẩy → **Unfortunately**.', 'adverb'],
      ['The hotel is _______ inexpensive for such a central location.', ['relative', 'relatively', 'relation', 'relating'], 1, 'Bổ nghĩa cho tính từ *inexpensive* → trạng từ **relatively**.', 'adverb']
    ] },
  { id: 'cond', lv: 3, tag: 'cond', t: 'Câu điều kiện và đảo ngữ', en: 'Conditionals & Inversion', sum: 'Ba loại câu điều kiện và dạng đảo ngữ Should/Were/Had ở đầu câu. Dạng đảo ngữ xuất hiện đều ở mức 800+.',
    body: [
      'tbl:Loại|Mệnh đề if|Mệnh đề chính;1 (có thể xảy ra)|If + hiện tại đơn|will / can / please + V;2 (không có thật hiện tại)|If + quá khứ (were)|would + V;3 (không có thật quá khứ)|If + had + V3|would have + V3',
      'h:Đảo ngữ thay cho if (văn trang trọng, rất hay gặp trong email TOEIC)',
      'li:**Should** + S + V = If S should V: ***Should** you have any questions, please contact me.*',
      'li:**Were** + S + to V / adj = If S were: ***Were** we to lower prices, sales would rise.*',
      'li:**Had** + S + V3 = If S had V3: ***Had** we known, we would have called.*',
      'ex:Should you need further assistance, please call our help desk.|Nếu bạn cần hỗ trợ thêm, vui lòng gọi bộ phận hỗ trợ.',
      'trap:Câu bắt đầu bằng chỗ trống + *you have any questions, please…* → chọn **Should** (không phải If have, Were).'
    ],
    quiz: [
      ['_______ you require any further information, please do not hesitate to contact us.', ['If', 'Should', 'Had', 'Unless'], 1, 'Đảo ngữ điều kiện loại 1: **Should** + S + V nguyên mẫu.', 'cond'],
      ['If the shipment _______ on time, we would have met the deadline.', ['arrives', 'arrived', 'had arrived', 'would arrive'], 2, 'Vế chính *would have met* → loại 3: **had arrived**.', 'cond'],
      ['_______ we known about the delay, we would have rescheduled the meeting.', ['If', 'Had', 'Should', 'Were'], 1, 'Đảo ngữ loại 3: **Had** + S + V3.', 'cond'],
      ['If I _______ you, I would accept the job offer.', ['am', 'was being', 'were', 'had been'], 2, 'Loại 2: *If I were you*.', 'cond'],
      ['If the weather is bad tomorrow, the outdoor event _______ moved indoors.', ['is', 'will be', 'would be', 'had been'], 1, 'Loại 1 → **will be** moved.', 'cond'],
      ['_______ the company to expand overseas, it would need more capital.', ['If', 'Should', 'Were', 'Had'], 2, 'Đảo ngữ loại 2: **Were** + S + to V.', 'cond']
    ] },
  { id: 'subj', lv: 3, tag: 'subj', t: 'Thức giả định', en: 'Subjunctive', sum: 'Sau recommend, request, require, suggest, insist, ask that… và It is essential/important/necessary that… động từ để nguyên mẫu, không chia.',
    body: [
      'li:Động từ: **recommend, suggest, request, require, insist, demand, ask, propose, advise + that + S + V (nguyên mẫu)**.',
      'li:Tính từ: **It is essential / important / necessary / imperative / vital / crucial + that + S + V (nguyên mẫu)**.',
      'li:Phủ định: *that he **not** be late*. Bị động: *that the report **be** submitted*.',
      'ex:The manager requested that all staff be present at the meeting.|Quản lý yêu cầu toàn bộ nhân viên có mặt ở cuộc họp.',
      'ex:It is essential that every visitor wear a helmet.|Mọi khách tham quan bắt buộc phải đội mũ bảo hộ.',
      'trap:Chủ ngữ số ít vẫn dùng nguyên mẫu: *that she **attend***, không phải *attends*.'
    ],
    quiz: [
      ['The director recommended that the budget _______ before the next meeting.', ['revises', 'be revised', 'is revised', 'will be revised'], 1, 'Sau *recommend that* dùng nguyên mẫu, ngân sách được sửa → **be revised**.', 'subj'],
      ['It is essential that every employee _______ the safety training.', ['complete', 'completes', 'completed', 'will complete'], 0, '*It is essential that* + V nguyên mẫu → **complete**.', 'subj'],
      ['The client insisted that the shipment _______ by Friday.', ['arrives', 'arrive', 'arrived', 'is arriving'], 1, 'Sau *insist that* dùng nguyên mẫu → **arrive**.', 'subj'],
      ['Our policy requires that all receipts _______ with expense reports.', ['are submitted', 'be submitted', 'submitted', 'submitting'], 1, '*require that* + bị động nguyên mẫu → **be submitted**.', 'subj'],
      ['Ms. Lee suggested that Mr. Park _______ the presentation instead.', ['gives', 'give', 'gave', 'giving'], 1, '*suggest that* + V nguyên mẫu → **give**.', 'subj']
    ] },
  { id: 'nounclause', lv: 3, tag: 'noun', t: 'Mệnh đề danh từ: what, whether, that', en: 'Noun Clauses', sum: 'Mệnh đề làm chủ ngữ hoặc tân ngữ: what (cái mà), whether/if (liệu), that (rằng), how, why, when, who.',
    body: [
      'li:**what** = the thing that, thiếu chủ ngữ hoặc tân ngữ phía sau: *I don\'t know **what** caused the delay.*',
      'li:**that** + câu đầy đủ: *The report shows **that** sales increased.*',
      'li:**whether (or not)** = liệu có hay không; *whether* đứng đầu câu làm chủ ngữ được, *if* thì không.',
      'li:**whoever, whatever, whichever, however** = bất cứ ai/cái gì.',
      'ex:Whether the event will be held outdoors depends on the weather.|Việc sự kiện có tổ chức ngoài trời hay không tùy thuộc thời tiết.',
      'trap:Sau giới từ dùng *whether*, không dùng *if*: *questions about **whether** to expand*.'
    ],
    quiz: [
      ['The manager asked _______ the shipment had been sent.', ['what', 'whether', 'which', 'that what'], 1, 'Hỏi liệu có hay không → **whether**.', 'noun'],
      ['_______ the company needs now is a clear marketing plan.', ['That', 'What', 'Which', 'Whether'], 1, 'Thiếu tân ngữ của *needs* → **What** (cái mà).', 'noun'],
      ['The survey shows _______ most customers prefer online payment.', ['what', 'that', 'whether', 'which'], 1, 'Sau là câu đầy đủ, nghĩa *rằng* → **that**.', 'noun'],
      ['_______ arrives first should unlock the office.', ['Whoever', 'Whatever', 'Whichever', 'However'], 0, 'Bất cứ ai đến trước → **Whoever**.', 'noun'],
      ['We are still discussing _______ to hire another designer.', ['if', 'whether', 'that', 'what'], 1, '*whether* + to V (if không đi với to V).', 'noun']
    ] },
  { id: 'transition', lv: 2, tag: 'transition', t: 'Từ nối giữa các câu (Part 6)', en: 'Transitions', sum: 'However, therefore, in addition, otherwise, meanwhile, as a result… Part 6 luôn có câu hỏi từ nối, phải đọc câu trước và câu sau.',
    body: [
      'tbl:Quan hệ|Từ nối;Bổ sung|in addition, additionally, moreover, furthermore, also, besides;Tương phản|however, nevertheless, on the other hand, in contrast, even so, instead;Kết quả|therefore, thus, as a result, consequently, accordingly, hence;Thời gian|meanwhile, afterward, subsequently, in the meantime, then, eventually, previously;Điều kiện ngược|otherwise (nếu không thì);Ví dụ|for example, for instance, in particular;Kết luận|in short, overall, in summary',
      'li:Từ nối đứng đầu câu, sau dấu chấm hoặc chấm phẩy, thường có dấu phẩy theo sau.',
      'li:Cách làm: đọc **câu trước** và **câu sau**, xác định quan hệ (thêm ý, đối lập, kết quả…) rồi mới nhìn đáp án.',
      'ex:The software is easy to use. In addition, it is free for students.|Phần mềm dễ dùng. Ngoài ra, nó miễn phí cho sinh viên.',
      'ex:Please confirm by Friday; otherwise, your reservation will be canceled.|Vui lòng xác nhận trước thứ Sáu; nếu không, đặt chỗ sẽ bị hủy.',
      'trap:*however* là trạng từ nối câu, không nối hai mệnh đề bằng dấu phẩy như *but*. *Instead* dùng khi thay thế một phương án.'
    ],
    quiz: [
      ['The hotel is close to the airport. _______, it offers a free shuttle service.', ['However', 'In addition', 'Otherwise', 'Instead'], 1, 'Câu sau thêm một ưu điểm → **In addition**.', 'transition'],
      ['Sales dropped sharply in March. _______, the company reduced its advertising budget.', ['As a result', 'For example', 'Nevertheless', 'Meanwhile'], 0, 'Câu sau là hệ quả → **As a result**.', 'transition'],
      ['Please register by May 1; _______, you may not get a seat.', ['therefore', 'otherwise', 'moreover', 'however'], 1, 'Nếu không đăng ký thì không có chỗ → **otherwise**.', 'transition'],
      ['The original venue was too small. _______, the event will be held at City Hall.', ['Instead', 'Besides', 'For instance', 'Similarly'], 0, 'Thay thế phương án cũ → **Instead**.', 'transition'],
      ['The renovation will take three weeks. _______, staff will work from the second floor.', ['In contrast', 'Meanwhile', 'Therefore', 'In short'], 1, 'Trong thời gian đó → **Meanwhile**.', 'transition'],
      ['The new model is more expensive. _______, it uses far less energy.', ['As a result', 'However', 'Furthermore', 'Thus'], 1, 'Ý đối lập (đắt hơn nhưng tiết kiệm điện) → **However**.', 'transition']
    ] },
  { id: 'modals', lv: 2, tag: 'modal', t: 'Động từ khuyết thiếu', en: 'Modal Verbs', sum: 'Can, could, may, might, must, should, would, have to, be able to, had better. Theo sau luôn là động từ nguyên mẫu.',
    body: [
      'li:Modal + **V nguyên mẫu**: *must **submit***, *should **be** reviewed*.',
      'li:Modal + **have + V3** nói về quá khứ: *should have called* (lẽ ra nên gọi), *may have left* (có lẽ đã rời đi), *must have forgotten* (chắc hẳn đã quên).',
      'li:Lời đề nghị lịch sự: *Would you like…? Could you…? Would you mind + V-ing?*',
      'ex:Visitors must sign in at the front desk.|Khách phải ký tên ở quầy lễ tân.',
      'trap:Sau modal không chia động từ: *She can **speaks*** là sai.'
    ],
    quiz: [
      ['All passengers must _______ their passports at the gate.', ['show', 'shows', 'showing', 'shown'], 0, 'Sau *must* + V nguyên mẫu **show**.', 'modal'],
      ['The report should _______ to the director by noon.', ['send', 'be sent', 'sending', 'sent'], 1, 'Báo cáo được gửi → **be sent**.', 'modal'],
      ['Mr. Ito is not at his desk; he _______ have gone to lunch.', ['must', 'should', 'would', 'can'], 0, 'Suy đoán chắc chắn về quá khứ → **must** have gone.', 'modal'],
      ['Would you mind _______ the window?', ['close', 'to close', 'closing', 'closed'], 2, '*Would you mind* + **V-ing**.', 'modal'],
      ['We _______ have ordered more chairs; there are not enough for everyone.', ['should', 'must', 'can', 'will'], 0, 'Lẽ ra nên đặt → **should** have ordered.', 'modal']
    ] },
  { id: 'others', lv: 3, tag: 'pronoun', t: 'Another, other, the other, others', en: 'Another / Other / Each other', sum: 'Phân biệt các dạng của other và các đại từ bất định one, ones, each other, one another.',
    body: [
      'tbl:Từ|Đi với|Ví dụ;another|danh từ số ít (một cái khác)|another option;other|danh từ số nhiều/không đếm được|other options;the other|cái còn lại (xác định)|the other room;others|đại từ = other + N số nhiều|Some prefer tea; others prefer coffee.;the others|những cái còn lại|the others are in the box;each other / one another|lẫn nhau|work with each other',
      'ex:One of the printers works; the other is being repaired.|Một máy in chạy được; máy còn lại đang sửa.',
      'trap:*another* + danh từ số ít, nhưng *another two days* (thêm 2 ngày nữa) vẫn đúng với số đếm.'
    ],
    quiz: [
      ['Could I have _______ copy of the agenda?', ['other', 'another', 'others', 'the others'], 1, 'Danh từ số ít *copy* → **another**.', 'pronoun'],
      ['Some employees take the bus; _______ drive to work.', ['another', 'other', 'others', 'the other'], 2, 'Đại từ thay cho *other employees* → **others**.', 'pronoun'],
      ['The two departments work closely with _______.', ['each other', 'another', 'other', 'themselves'], 0, 'Lẫn nhau → **each other**.', 'pronoun'],
      ['We have two meeting rooms; one is booked, but _______ is available.', ['another', 'other', 'the other', 'others'], 2, 'Cái còn lại trong hai cái → **the other**.', 'pronoun'],
      ['Please contact us if you have any _______ questions.', ['another', 'other', 'others', 'the other'], 1, 'Trước danh từ số nhiều *questions* → **other**.', 'pronoun']
    ] },
  { id: 'emphasis', lv: 3, tag: 'compare', t: 'So / such, too / enough', en: 'So, Such, Too, Enough', sum: 'So + adj/adv, such + (a) + adj + noun, too + adj + to V, adj + enough + to V.',
    body: [
      'li:**so + adj/adv + that**: *The demand was **so high** that we sold out.*',
      'li:**such + (a/an) + adj + noun + that**: *It was **such a popular** product that…*',
      'li:**too + adj + (for sb) + to V** = quá … không thể.',
      'li:**adj/adv + enough + to V**, **enough + noun**: *large enough*, *enough seats*.',
      'ex:The package was too heavy to send by regular mail.|Gói hàng quá nặng để gửi thường.',
      'trap:*enough* đứng **sau** tính từ nhưng **trước** danh từ.'
    ],
    quiz: [
      ['The response was _______ positive that we extended the promotion.', ['such', 'so', 'too', 'enough'], 1, '*so + tính từ + that*.', 'compare'],
      ['It was _______ a successful event that we plan to hold it again.', ['so', 'such', 'too', 'very'], 1, '*such + a + adj + noun*.', 'compare'],
      ['The room is not large _______ for 50 people.', ['too', 'so', 'enough', 'such'], 2, '*adj + enough*.', 'compare'],
      ['The report was _______ long to read before the meeting.', ['so', 'too', 'such', 'enough'], 1, '*too + adj + to V* = quá … để làm gì.', 'compare'],
      ['We do not have _______ chairs for all the guests.', ['enough', 'too', 'so', 'such'], 0, '*enough + danh từ*.', 'compare']
    ] },
  { id: 'confusing', lv: 3, tag: 'vocab', t: 'Cặp từ dễ nhầm', en: 'Commonly Confused Words', sum: 'Rise/raise, lie/lay, affect/effect, borrow/lend, remind/remember, convince/persuade… và các từ gần nghĩa hay làm đáp án nhiễu.',
    body: [
      'tbl:Cặp|Phân biệt;rise / raise|*rise* (tự tăng, không tân ngữ) – *raise* (nâng, tăng cái gì, có tân ngữ): prices **rose**; we **raised** prices;affect / effect|*affect* (v) ảnh hưởng – *effect* (n) tác động; *take effect* = có hiệu lực;lend / borrow|*lend sb sth* cho mượn – *borrow sth from sb* đi mượn;remind / remember|*remind sb to V* nhắc ai – *remember to V* nhớ phải làm;say / tell|*tell sb sth* – *say sth (to sb)*;economic / economical|*economic* thuộc kinh tế – *economical* tiết kiệm;considerable / considerate|*considerable* đáng kể – *considerate* chu đáo;responsible / responsive|*responsible for* chịu trách nhiệm – *responsive to* phản hồi nhanh;personal / personnel|*personal* cá nhân – *personnel* nhân sự;complement / compliment|*complement* bổ sung – *compliment* khen',
      'trap:*arise, rise, occur, happen* là nội động từ, không có bị động, không có tân ngữ.'
    ],
    quiz: [
      ['The price of fuel has _______ sharply this month.', ['raised', 'risen', 'arisen', 'lifted'], 1, 'Giá tự tăng, không tân ngữ → **risen**.', 'vocab'],
      ['The new law will take _______ on January 1.', ['affect', 'effect', 'effective', 'effectively'], 1, '*take effect* = có hiệu lực.', 'vocab'],
      ['Could you _______ me your calculator for a moment?', ['borrow', 'lend', 'loan to', 'give back'], 1, '*lend sb sth* = cho ai mượn.', 'vocab'],
      ['Please _______ Mr. Gomez to bring the contract tomorrow.', ['remember', 'remind', 'recall', 'memorize'], 1, '*remind sb to V*.', 'vocab'],
      ['Buying in bulk is more _______ for small businesses.', ['economic', 'economical', 'economy', 'economist'], 1, 'Tiết kiệm → **economical**.', 'vocab'],
      ['The company plans to _______ salaries by 5 percent next year.', ['rise', 'raise', 'arise', 'grow'], 1, 'Tăng cái gì (có tân ngữ *salaries*) → **raise**.', 'vocab']
    ] },
  { id: 'verbcolloc', lv: 3, tag: 'colloc', t: 'Collocation động từ và danh từ', en: 'Verb–Noun Collocations', sum: 'Make a reservation, meet a deadline, conduct a survey, address a concern… Part 5 câu từ vựng khó thường kiểm tra kết hợp từ.',
    body: [
      'tbl:Động từ|Đi với;make|a reservation, a decision, a payment, a profit, an effort, an appointment, a presentation, changes;do|business, research, a favor, damage;meet|a deadline, a need, a demand, requirements, expectations, a goal;conduct|a survey, research, an interview, an inspection, a study;place|an order, an advertisement, emphasis on;address|a concern, an issue, a problem, a letter to;raise|funds, awareness, a question, prices;launch|a product, a campaign, an investigation;submit|an application, a proposal, a report;reach|an agreement, a decision, a target, a consensus;hold|a meeting, an event, a position;draw|attention, a conclusion, a crowd;exceed|expectations, the limit, the budget',
      'ex:We conducted a survey of 500 customers.|Chúng tôi đã tiến hành khảo sát 500 khách hàng.',
      'ex:The new product exceeded our expectations.|Sản phẩm mới vượt mong đợi của chúng tôi.'
    ],
    quiz: [
      ['The research team will _______ a survey of local businesses next month.', ['make', 'conduct', 'do', 'take'], 1, '*conduct a survey*.', 'colloc'],
      ['We hired extra staff to _______ the growing demand.', ['meet', 'reach', 'achieve', 'make'], 0, '*meet the demand*.', 'colloc'],
      ['The manager promised to _______ the customers\' concerns at the meeting.', ['address', 'speak', 'tell', 'answer to'], 0, '*address concerns* = giải quyết mối quan tâm.', 'colloc'],
      ['The charity dinner _______ over $20,000 for the hospital.', ['rose', 'raised', 'grew', 'lifted'], 1, '*raise funds/money* = gây quỹ.', 'colloc'],
      ['After long talks, the two sides finally _______ an agreement.', ['made', 'did', 'reached', 'got to'], 2, '*reach an agreement*.', 'colloc'],
      ['You can _______ an order by phone or online.', ['put', 'place', 'set', 'give'], 1, '*place an order*.', 'colloc']
    ] },
  { id: 'insert', lv: 3, tag: 'insert', t: 'Chiến thuật câu chèn câu (Part 6–7)', en: 'Sentence Insertion', sum: 'Mỗi đoạn Part 6 có 1 câu chọn câu phù hợp, Part 7 có 2 câu chèn vị trí. Dựa vào từ quy chiếu (this, these, such, they, also) và mạch ý.',
    body: [
      'li:Tìm **từ quy chiếu** trong câu cần chèn: *this, these, those, such, it, they, the company, the program*. Câu đó phải đứng **sau** câu nhắc tới danh từ được quy chiếu.',
      'li:Tìm **từ nối**: *however, also, in addition, therefore, for example*. Xác định quan hệ với câu đứng trước.',
      'li:Câu chứa **thông tin chung** thường mở đoạn; câu chứa **ví dụ, chi tiết** đứng sau câu chung.',
      'li:Câu kết thường là lời cảm ơn, lời kêu gọi hành động: *Please contact us…*, *We look forward to…*',
      'ex:Our store now offers free delivery. **This service** is available for orders over $50.|"This service" quy chiếu đến "free delivery" ở câu trước.',
      'trap:Đừng chọn câu chỉ vì có từ khóa giống đoạn văn. Câu đúng phải khớp cả mạch ý trước và sau nó.'
    ],
    quiz: [
      ['Our café will close at 3 P.M. on Friday for a private event. _______ We apologize for any inconvenience.', ['Regular hours will resume on Saturday.', 'The menu includes vegetarian dishes.', 'We were founded in 2010.', 'Parking is available behind the building.'], 0, 'Câu sau xin lỗi vì bất tiện; câu cần chèn tiếp tục ý về giờ mở cửa → **Regular hours will resume on Saturday.**', 'insert'],
      ['We have received your application for the accounting position. _______ We will contact you within two weeks.', ['Our team is currently reviewing all applications.', 'The accounting software is easy to use.', 'Please enjoy your stay.', 'Your order has been shipped.'], 0, 'Mạch ý: đã nhận đơn → đang xem xét → sẽ liên hệ. Câu đúng: **Our team is currently reviewing all applications.**', 'insert'],
      ['The museum is introducing evening hours on Thursdays. _______ Visitors can also enjoy live music in the courtyard.', ['The galleries will stay open until 9 P.M.', 'The museum was built in 1902.', 'Tickets are not refundable.', 'Photography is not allowed.'], 0, 'Câu sau có *also*, tức trước đó là một tiện ích khác của buổi tối → **The galleries will stay open until 9 P.M.**', 'insert']
    ] }
];
