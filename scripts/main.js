document.addEventListener("DOMContentLoaded", () => {
	const STORAGE_KEY = "mini-elearn:courses";
	const storageAvailable = isLocalStorageAvailable();
	const state = {
		courses: initializeCourses(),
		currentCourseId: null,
	};

	const selectors = {
		homeView: document.querySelector("#home-view"),
		courseView: document.querySelector("#course-view"),
		courseGrid: document.querySelector("#course-grid"),
		courseHeading: document.querySelector("#course-heading"),
		courseDescription: document.querySelector(".course-description"),
		lessonList: document.querySelector(".lesson-list"),
		progressBar: document.querySelector(".progress-bar"),
		progressFill: document.querySelector(".progress-bar-fill"),
		progressLabel: document.querySelector("#progress-percentage"),
		detailActions: document.querySelector(".detail-actions"),
		template: document.querySelector("#course-card-template"),
		year: document.querySelector("#year"),
	};

	const routes = {
		home: () => showHome(),
		courses: () => showHome(),
		course: (id) => showCourseDetail(id),
	};

	init();

	function init() {
		renderCourseList();
		persistCourses();
		updateYear();
		setupNavigation();
		handleInitialRoute();
	}

	function initializeCourses() {
		const defaults = getDefaultCourses();
		const persisted = loadPersistedCourses();
		return hydrateCourses(defaults, persisted);
	}

	function getDefaultCourses() {
		// Data source: an in-memory JSON structure for simplicity.
		return [
			{
				id: "course-html-basics",
				name: "HTML Fundamentals",
				description:
					"Learn the building blocks of the web with semantic HTML and accessible layouts.",
				summary:
					"Understand the structure of web pages using semantic elements.",
				image: "images/html_fundamentals.png",
				lessons: [
					{ title: "Introduction to HTML", duration: "10 min", completed: true },
					{ title: "Headings and Text", duration: "12 min", completed: false },
					{ title: "Links and Images", duration: "15 min", completed: false },
					{ title: "Lists and Tables", duration: "18 min", completed: false },
				],
				completed: false,
			},
			{
				id: "course-css-layouts",
				name: "Responsive CSS Layouts",
				description:
					"Design responsive layouts using modern CSS techniques such as Grid and Flexbox.",
				summary: "Craft flexible layouts that look great on every device.",
				image: "images/css_layouts.png",
				lessons: [
					{ title: "CSS Box Model", duration: "8 min", completed: true },
					{ title: "Flexbox Essentials", duration: "16 min", completed: false },
					{ title: "Grid Layout", duration: "22 min", completed: false },
					{ title: "Media Queries", duration: "12 min", completed: false },
				],
				completed: false,
			},
			{
				id: "course-js-interactivity",
				name: "JavaScript Interactivity",
				description:
					"Enhance user experience with dynamic, interactive features using vanilla JavaScript.",
				summary: "Add logic and interactivity to bring your interfaces to life.",
				image: "images/javascript.png",
				lessons: [
					{ title: "Variables and Data Types", duration: "14 min", completed: true },
					{ title: "Functions and Events", duration: "18 min", completed: true },
					{ title: "DOM Manipulation", duration: "20 min", completed: false },
					{ title: "State Management", duration: "15 min", completed: false },
				],
				completed: false,
			},
		];
	}

	function hydrateCourses(defaultCourses, persistedCourses) {
		if (!Array.isArray(persistedCourses) || !persistedCourses.length) {
			return defaultCourses;
		}

		const merged = defaultCourses.map((course) => {
			const stored = persistedCourses.find((item) => item.id === course.id);
			if (!stored) {
				return course;
			}

			const lessons = Array.isArray(course.lessons)
				? course.lessons.map((lesson, index) => {
					const storedLesson = stored.lessons?.[index];
					return storedLesson
						? { ...lesson, completed: Boolean(storedLesson.completed) }
						: lesson;
				})
				: course.lessons;

			return {
				...course,
				completed: Boolean(stored.completed),
				lessons,
			};
		});

		const additionalCourses = persistedCourses.filter(
			(course) => !defaultCourses.some((item) => item.id === course.id)
		);

		return [...merged, ...additionalCourses];
	}

	function renderCourseList() {
		selectors.courseGrid.innerHTML = "";

		state.courses.forEach((course) => {
			const card = buildCourseCard(course);
			selectors.courseGrid.appendChild(card);
		});
	}

	function buildCourseCard(course) {
		const card = selectors.template.content.firstElementChild.cloneNode(true);
		const titleEl = card.querySelector(".course-title");
		const summaryEl = card.querySelector(".course-summary");
		const viewButton = card.querySelector(".view-details");
		const completeButton = card.querySelector(".mark-completed");
		const imageEl = card.querySelector(".course-image");

		titleEl.textContent = course.name;
		summaryEl.textContent = course.summary || course.description;
		imageEl.src = course.image || "images/course-placeholder.svg";
		imageEl.alt = `${course.name} illustration`;

		if (course.completed) {
			applyCompletedState(card, completeButton);
		}

		viewButton.addEventListener("click", () => navigateToCourse(course.id));

		completeButton.addEventListener("click", () => {
			toggleCourseCompletion(course.id, true);
		});

		card.dataset.courseId = course.id;

		return card;
	}

	function setupNavigation() {
		document.body.addEventListener("click", (event) => {
			const routeLink = event.target.closest("[data-route]");
			if (!routeLink) return;

			event.preventDefault();
			const route = routeLink.dataset.route;

			if (route === "home" || route === "courses") {
				navigate("home");
			}
		});
	}

	function handleInitialRoute() {
		const hash = window.location.hash.replace("#", "");
		if (!hash) {
			navigate("home");
			return;
		}

		const [route, id] = hash.split(":");
		if (routes[route]) {
			routes[route](id);
		} else {
			navigate("home");
		}
	}

	function navigateToCourse(courseId) {
		state.currentCourseId = courseId;
		window.location.hash = `course:${courseId}`;
		showCourseDetail(courseId);
	}

	function navigate(route) {
		window.location.hash = route === "home" ? "home" : route;
		routes[route]?.();
	}

	function showHome() {
		state.currentCourseId = null;
		selectors.courseView.hidden = true;
		selectors.homeView.hidden = false;
		selectors.homeView.focus?.();
	}

	function showCourseDetail(courseId) {
		const course = state.courses.find((item) => item.id === courseId);
		if (!course) {
			navigate("home");
			return;
		}

		state.currentCourseId = courseId;
		selectors.homeView.hidden = true;
		selectors.courseView.hidden = false;

		selectors.courseHeading.textContent = course.name;
		selectors.courseDescription.textContent = course.description;

		renderLessons(course);
		renderProgress(course);
		renderDetailActions(course);
		updateDetailClasses(course);
	}

	function renderLessons(course) {
		selectors.lessonList.innerHTML = "";

		course.lessons.forEach((lesson, index) => {
			const item = document.createElement("li");
			item.className = "lesson-item";

			const title = document.createElement("span");
			title.className = "lesson-title";
			title.textContent = `${index + 1}. ${lesson.title}`;

			const meta = document.createElement("span");
			meta.className = "lesson-meta";
			meta.textContent = lesson.duration;

			if (lesson.completed) {
				item.classList.add("lesson-item--completed");
				meta.setAttribute("aria-label", "Completed lesson");
			}

			item.append(title, meta);
			selectors.lessonList.appendChild(item);
		});
	}

	function renderProgress(course) {
		const percent = calculateProgress(course);
		selectors.progressLabel.textContent = `${percent}%`;
		selectors.progressFill.style.width = `${percent}%`;
		selectors.progressBar.setAttribute("aria-valuenow", String(percent));
	}

	function renderDetailActions(course) {
		const completeButton = selectors.detailActions.querySelector(".complete-course");
		const isCompleted = course.completed;

		completeButton.textContent = isCompleted ? "Completed" : "Mark as completed";
		completeButton.disabled = isCompleted;
		completeButton.setAttribute("aria-pressed", String(isCompleted));

		completeButton.onclick = () => toggleCourseCompletion(course.id, true);
	}

	function updateDetailClasses(course) {
		selectors.courseView.classList.toggle("course-view--completed", course.completed);
	}

	function toggleCourseCompletion(courseId, shouldScroll = false) {
		const course = state.courses.find((item) => item.id === courseId);
		if (!course || course.completed) return;

		course.completed = true;
		course.lessons = course.lessons.map((lesson) => ({ ...lesson, completed: true }));

		renderCourseList();
		persistCourses();

		if (state.currentCourseId === courseId) {
			renderLessons(course);
			renderProgress(course);
			renderDetailActions(course);
			updateDetailClasses(course);

			if (shouldScroll) {
				selectors.courseView.scrollIntoView({ behavior: "smooth" });
			}
		}
	}

	function calculateProgress(course) {
		if (!course.lessons.length) return 0;
		const completedLessons = course.lessons.filter((lesson) => lesson.completed).length;
		return Math.round((completedLessons / course.lessons.length) * 100);
	}

	function applyCompletedState(card, button) {
		card.classList.add("course-card--completed");
		button.textContent = "Completed";
		button.disabled = true;
		button.setAttribute("aria-pressed", "true");
	}

	function updateYear() {
		if (selectors.year) {
			selectors.year.textContent = new Date().getFullYear();
		}
	}

	function loadPersistedCourses() {
		if (!storageAvailable) {
			return null;
		}

		try {
			const raw = localStorage.getItem(STORAGE_KEY);
			if (!raw) {
				return null;
			}

			const parsed = JSON.parse(raw);
			return Array.isArray(parsed) ? parsed : null;
		} catch (error) {
			console.warn("Mini E-Learn: Unable to read saved progress.", error);
			return null;
		}
	}

	function persistCourses() {
		saveCoursesToStorage(state.courses);
	}

	function saveCoursesToStorage(courses) {
		if (!storageAvailable) {
			return;
		}

		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(courses));
		} catch (error) {
			console.warn("Mini E-Learn: Unable to save progress.", error);
		}
	}

	function isLocalStorageAvailable() {
		try {
			const testKey = "__mini-elearn-storage__";
			localStorage.setItem(testKey, "ok");
			localStorage.removeItem(testKey);
			return true;
		} catch (error) {
			console.warn("Mini E-Learn: Local storage not available.", error);
			return false;
		}
	}

	window.addEventListener("hashchange", handleInitialRoute);
});
