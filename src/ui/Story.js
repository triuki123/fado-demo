export const chapters = [
  {
    at: 0,
    name: "VẬN HÀNH KẾT NỐI",
    eyebrow: "FADO / VẬN HÀNH THÔNG MINH",
    title: "VẬN HÀNH<br>RÕ RÀNG.<br><em>ĐÚNG NHỊP.</em>",
    description:
      "Một góc nhìn trực quan về cách dữ liệu, tài sản và quy trình cùng vận hành.",
  },
  {
    at: 0.15,
    name: "TRUNG TÂM ĐIỀU PHỐI",
    eyebrow: "01 / GÓC NHÌN TẬP TRUNG",
    title: "NHÌN TOÀN CẢNH.<br><em>ĐIỀU HÀNH CHỦ ĐỘNG.</em>",
    description:
      "Mọi trạng thái quan trọng cùng xuất hiện trong một bức tranh vận hành chung.",
  },
  {
    at: 0.28,
    name: "ĐIỂM GIAO DỊCH",
    eyebrow: "02 / DỮ LIỆU VẬN HÀNH",
    title: "THÔNG TIN RÕ.<br><em>HÀNH ĐỘNG NHANH.</em>",
    description:
      "Tạo ngữ cảnh chung để đội ngũ xử lý công việc với thông tin nhất quán.",
  },
  {
    at: 0.42,
    name: "KHU VỰC TÀI SẢN",
    eyebrow: "03 / TÀI SẢN TRONG TẦM NHÌN",
    title: "THEO DÕI<br><em>CÓ TRẬT TỰ.</em>",
    description:
      "Trạng thái và điểm chạm được tổ chức trực quan, sẵn sàng để theo dõi.",
  },
  {
    at: 0.55,
    name: "TRUNG TÂM VẬN HÀNH",
    eyebrow: "04 / QUY TRÌNH KẾT NỐI",
    title: "CÔNG VIỆC<br><em>LIỀN MẠCH.</em>",
    description:
      "Các bước vận hành liên kết để công việc chuyển tiếp mạch lạc giữa đội ngũ.",
  },
  {
    at: 0.61,
    name: "KHU VỰC LOGISTICS",
    eyebrow: "05 / LUỒNG VẬN HÀNH",
    title: "KẾT NỐI NHIỀU<br><em>ĐIỂM CHẠM.</em>",
    description:
      "Một mô hình trực quan cho các hoạt động cần phối hợp trong cùng một nhịp.",
  },
  {
    at: 0.74,
    name: "ĐIỂM KẾT NỐI",
    eyebrow: "06 / VẬN HÀNH MỞ RỘNG",
    title: "MỞ RỘNG GÓC NHÌN.<br><em>GIỮ ĐÚNG NHỊP.</em>",
    description:
      "Nền tảng hỗ trợ đội ngũ duy trì một góc nhìn rõ ràng khi công việc phát triển.",
  },
  {
    at: 0.88,
    name: "FADO",
    eyebrow: "07 / INTELLIGENT BUSINESS OPERATIONS PLATFORM",
    title: "DỮ LIỆU.<br>QUY TRÌNH.<br><em>HÀNH ĐỘNG.</em>",
    description:
      "FADO — Intelligent Business Operations Platform.",
  },
];
export function createStory(scroll) {
  let current = 0,
    pending;
  const nav = document.querySelector("#destinations");
  chapters.forEach((c, i) => {
    const b = document.createElement("button");
    b.innerHTML = `<span>${c.name}</span><i></i>`;
    b.setAttribute("aria-label", c.name);
    b.onclick = () => scroll.go(i === 7 ? 1 : c.at + 0.035);
    nav.append(b);
  });
  document.querySelectorAll("[data-go]").forEach(
    (a) =>
      (a.onclick = (e) => {
        e.preventDefault();
        scroll.go(Number(a.dataset.go));
      }),
  );
  document.querySelectorAll("[data-section]").forEach(
    (a) =>
      (a.onclick = (e) => {
        e.preventDefault();
        document.querySelector(a.dataset.section).scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }),
  );
  document.querySelector(".brand").onclick = (e) => {
    e.preventDefault();
    scroll.go(0);
  };
  document.querySelector("#explore").onclick = () =>
    current === 7
      ? document.querySelector("#contact").showModal()
      : scroll.go(chapters[current + 1].at + 0.035);
  const contact = document.querySelector("#contact");
  document.querySelector("#contact-open").onclick = () => contact.showModal();
  document.querySelector("#landing-contact").onclick = () => contact.showModal();
  document.querySelectorAll("dialog").forEach((dialog) => {
    dialog.querySelector(".close").onclick = () => dialog.close();
    dialog.addEventListener("click", (e) => {
      if (e.target === dialog) {
        const r = dialog.getBoundingClientRect();
        if (
          e.clientX < r.left ||
          e.clientX > r.right ||
          e.clientY < r.top ||
          e.clientY > r.bottom
        )
          dialog.close();
      }
    });
  });
  return (progress) => {
    const index = chapters.findLastIndex((c) => progress >= c.at);
    document.querySelector("#journey-progress").style.width =
      `${progress * 100}%`;
    document
      .querySelector("#header")
      .classList.toggle("scrolled", progress > 0.025);
    [...nav.children].forEach((b, i) => {
      b.classList.toggle("active", i === index);
      b.setAttribute("aria-current", i === index ? "step" : "false");
    });
    if (index === current) return;
    current = index;
    const story = document.querySelector("#story");
    story.classList.add("changing");
    clearTimeout(pending);
    pending = setTimeout(() => {
      const c = chapters[current];
      document.querySelector("#title").innerHTML = c.title;
      document.querySelector("#description").textContent = c.description;
      document.querySelector("#eyebrow").textContent = c.eyebrow;
      document.querySelector("#district-name").textContent = c.name;
      document.querySelector("#chapter").textContent = String(current).padStart(
        2,
        "0",
      );
      document.querySelector("#explore").innerHTML =
        current === 7
          ? "KHÁM PHÁ FADO <span>↗</span>"
          : "TIẾP TỤC KHÁM PHÁ <span>↗</span>";
      story.classList.remove("changing");
    }, 260);
  };
}
