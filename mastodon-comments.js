/*
 * Modified by Nube (2026)
 * Based on the original project by dpecos under the GPL-3.0 license:
 * https://github.com/dpecos/mastodon-comments
 *
 * Source code and modifications available at:
 * https://github.com/nubesurrealista/mastodon-comments
 */

// ============================================================
// Set language dependend texts
// ============================================================
const i18n = {
	en: {
		commentsTitle: "Comments",
		replyIntro:
			"You can use your Fediverse (i.e. Mastodon, among many others) account to reply to this",
		replyLinkText: "post",
		replyButtonLabel: "Reply",
		loadingText: "Loading comments from the Fediverse...",
		noCommentsText: "No comments found",
		dialogTitle: "Reply to this post",
		dialogCloseTitle: "Close",
		dialogCloseSymbol: "&times;",
		dialogExplain:
			"Comments are powered by the Fediverse. With an account on Mastodon (or elsewhere on the Fediverse), you can respond to this post. Simply enter your Fediverse instance below, and add a reply:",
		goButtonLabel: "Go",
		copyAlternativeText:
			"Alternatively, copy this URL and paste it into the search bar of your Fediverse app:",
		copyButtonLabel: "Copy",
		copiedButtonLabel: "Copied!",
		instancePlaceholder: "mastodon.social",
		instanceMissingAlert: "Please provide the name of your instance",
		dateLocale: "en-US",
	},
	de: {
		commentsTitle: "Kommentare",
		replyIntro:
			"Du kannst mit deinem Fediverse-Konto (z.B. Mastodon) auf diesen",
		replyLinkText: "Beitrag antworten",
		replyButtonLabel: "Antworten",
		loadingText: "Kommentare werden aus dem Fediverse geladen...",
		noCommentsText: "Keine Kommentare gefunden",
		dialogTitle: "Auf diesen Beitrag antworten",
		dialogCloseTitle: "Schließen",
		dialogCloseSymbol: "&times;",
		dialogExplain:
			"Kommentare werden über Mastodon bereitgestellt. Mit einem Konto bei Mastodon (oder anderswo im Fediverse) kannst du auf diesen Beitrag antworten. Gib einfach deine Mastodon-Instanz unten ein:",
		goButtonLabel: "Los",
		copyAlternativeText:
			"Alternativ kannst du diese URL kopieren und in die Suchleiste deiner Mastodon-App einfügen:",
		copyButtonLabel: "Kopieren",
		copiedButtonLabel: "Kopiert!",
		instancePlaceholder: "mastodon.social",
		instanceMissingAlert: "Bitte gib den Namen deiner Instanz an",
		dateLocale: "de-DE",
	},
	fr: {
		commentsTitle: "Commentaires",
		replyIntro:
			"Vous pouvez utiliser votre compte Fediverse (ex. Mastodon) pour répondre à ce",
		replyLinkText: "billet",
		replyButtonLabel: "Répondre",
		loadingText: "Chargement des commentaires depuis le Fediverse...",
		noCommentsText: "Aucun commentaire trouvé",
		dialogTitle: "Répondre à ce billet",
		dialogCloseTitle: "Fermer",
		dialogCloseSymbol: "&times;",
		dialogExplain:
			"Les commentaires sont alimentés par Mastodon. Avec un compte sur Mastodon (ou ailleurs sur le Fediverse), vous pouvez répondre à ce billet. Entrez simplement votre instance Mastodon ci-dessous:",
		goButtonLabel: "Aller",
		copyAlternativeText:
			"Vous pouvez aussi copier cette URL et la coller dans la barre de recherche de votre application Mastodon:",
		copyButtonLabel: "Copier",
		copiedButtonLabel: "Copié!",
		instancePlaceholder: "mastodon.social",
		instanceMissingAlert: "Veuillez indiquer le nom de votre instance",
		dateLocale: "fr-FR",
	},
	es: {
		commentsTitle: "Comentarios",
		replyIntro:
			"Puedes usar tu cuenta del Fediverso (ej. Mastodon, entre otros) para comentar este",
		replyLinkText: "post",
		replyButtonLabel: "Responder",
		loadingText: "Cargando comentarios del Fediverso...",
		noCommentsText: "No se han encontrado comentarios",
		dialogTitle: "Responde a este post",
		dialogCloseTitle: "Cerrar",
		dialogCloseSymbol: "&times;",
		dialogExplain:
			"Comentarios gracias al Fediverso. Con una cuenta en Mastodon (o en cualquier otro sitio en el Fediverso), puedes responder a esta entrada. Simplemente introduce tu instancia y pulsa responder:",
		goButtonLabel: "Ir",
		copyAlternativeText:
			"O puedes copiar esta URL y pegarla en el cuadro de búsqueda de tu aplicación fedi:",
		copyButtonLabel: "Copiar",
		copiedButtonLabel: "¡Copiado!",
		instancePlaceholder: "instanciarealnofake.ejemplo",
		instanceMissingAlert: "Por favor introduce tu instancia",
		dateLocale: "es-ES",
	},
};

const DEFAULT_LANG = "en";
// ============================================================

class MastodonComments extends HTMLElement {
	constructor() {
		super();

		this.host = this.getAttribute("host");
		this.user = this.getAttribute("user");
		this.tootId = this.getAttribute("tootId");
		this.filter = this.getAttribute("filter");

		this.commentsLoaded = false;
		this.tootAccountURI = null;

		// Resolve locale: attribute → <html lang> → default
		const lang =
			this.getAttribute("lang") ||
			document.documentElement.lang?.split("-")[0] ||
			navigator.language?.split("-")[0] ||
			DEFAULT_LANG;
		this.locale = i18n[lang] ?? i18n[DEFAULT_LANG];

		this.dateFormatter = new Intl.DateTimeFormat(this.locale.dateLocale, {
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
			hour: "2-digit",
			minute: "2-digit",
			hour12: false,
			formatMatcher: "basic",
		});
	}

	connectedCallback() {
		this.mastodonPostUrl = `https://${this.host}/notes/${this.tootId}`;

		this.innerHTML = `
		  <div id="mastodon-stats"></div>
		  <div id="mastodon-title">${this.locale.commentsTitle}</div>
		  <p>${this.locale.replyIntro} <a class="link"
			  href="${this.mastodonPostUrl}" rel="ugc">${this.locale.replyLinkText}</a>.
			  <button id="add-comment" class="button">${this.locale.replyButtonLabel}</button>
		  </p>

		  <ul id="mastodon-comments-list"></ul>

		  <dialog id="comment-dialog">
			<h3>${this.locale.dialogTitle}</h3>
			<button title="${this.locale.dialogCloseTitle}" id="close">${this.locale.dialogCloseSymbol}</button>
			<p>${this.locale.dialogExplain}</p>
			<div class="input-row">
			  <input type="text" inputmode="url" autocapitalize="none" autocomplete="off" value="${
					this.escapeHtml(localStorage.getItem("mastodonUrl")) ?? ""
				}" id="instanceName" placeholder="${this.locale.instancePlaceholder}">
			  <button class="button" id="go">${this.locale.goButtonLabel}</button>
			</div>
			<p>${this.locale.copyAlternativeText}</p>
			<div class="input-row">
			  <input type="text" readonly id="copyInput" value="${this.mastodonPostUrl}">
			  <button class="button" id="copy">${this.locale.copyButtonLabel}</button>
			</div>
		  </dialog>
		`;

		const comments = this.querySelector("#mastodon-comments-list");
		const rootStyle = this.getAttribute("style");
		if (rootStyle) {
			comments.setAttribute("style", rootStyle);
		}
		this.respondToVisibility(comments, this.loadComments.bind(this));

		this.initDialog();
	}

	initDialog() {
		const dialog = this.querySelector("#comment-dialog");
		const addCommentBtn = this.querySelector("#add-comment");
		const closeBtn = this.querySelector("#close");
		const goBtn = this.querySelector("#go");
		const copyBtn = this.querySelector("#copy");
		const instanceNameInput = this.querySelector("#instanceName");
		const copyInput = this.querySelector("#copyInput");

		addCommentBtn.addEventListener("click", () => {
			dialog.showModal();
		});

		closeBtn.addEventListener("click", () => {
			dialog.close();
		});

		dialog.addEventListener("keydown", (e) => {
			if (e.key === "Escape") {
				dialog.close();
			}
		});

		dialog.addEventListener("click", (event) => {
			var rect = dialog.getBoundingClientRect();
			var isInDialog =
				rect.top <= event.clientY &&
				event.clientY <= rect.top + rect.height &&
				rect.left <= event.clientX &&
				event.clientX <= rect.left + rect.width;
			if (!isInDialog) {
				dialog.close();
			}
		});

		goBtn.addEventListener("click", () => {
			let url = instanceNameInput.value.trim();
			if (url === "") {
				window.alert(this.locale.instanceMissingAlert);
				return;
			}
			localStorage.setItem("mastodonUrl", url);
			if (!url.startsWith("https://")) {
				url = `https://${url}`;
			}
			window.open(
				`${url}/authorize_interaction?uri=${this.mastodonPostUrl}`,
				"_blank",
			);
		});

		instanceNameInput.addEventListener("keydown", (e) => {
			if (e.key === "Enter") {
				goBtn.dispatchEvent(new Event("click"));
			}
		});

		copyBtn.addEventListener("click", () => {
			copyInput.select();
			navigator.clipboard.writeText(this.mastodonPostUrl);
			copyBtn.innerHTML = this.locale.copiedButtonLabel;
			window.setTimeout(() => {
				copyBtn.innerHTML = this.locale.copyButtonLabel;
			}, 1000);
		});
	}

	escapeHtml(unsafe) {
		return (unsafe || "")
			.replace(/&/g, "&amp;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;")
			.replace(/"/g, "&quot;")
			.replace(/'/g, "&#039;");
	}

	toot_active(toot, what) {
		var count = toot[what + "_count"];
		return count > 0 ? "active" : "";
	}

	toot_count(toot, what) {
		var count = toot[what + "_count"];
		return count > 0 ? count : "";
	}

	toot_stats(toot) {
		return `
		  <div class="replies ${this.toot_active(toot, "replies")}">
			<a href="${
				toot.url
			}" rel="ugc nofollow"><span class="stat-icon">↩</span>${this.toot_count(
				toot,
				"replies",
			)}</a>
		  </div>
		  <div class="reblogs ${this.toot_active(toot, "reblogs")}">
			<a href="${
				toot.url
			}/reblogs" rel="nofollow"><span class="stat-icon">⇄</span>${this.toot_count(
				toot,
				"reblogs",
			)}</a>
		  </div>
		  <div class="favourites ${this.toot_active(toot, "favourites")}">
			<a href="${
				toot.url
			}/favourites" rel="nofollow"><span class="stat-icon">★</span>${this.toot_count(
				toot,
				"favourites",
			)}</a>
		  </div>
		`;
	}

	user_account(account) {
		var result = `@${account.acct}`;
		if (account.acct.indexOf("@") === -1) {
			const domain = new URL(account.url);
			result += `@${domain.hostname}`;
		}
		return result;
	}

	formatDate(dateString) {
		return this.dateFormatter
			.format(new Date(dateString))
			.replace(",", "")
			.replace(/(\d+)\/(\d+)\/(\d+)/, "$3-$1-$2");
	}

	async render_toots(toots, in_reply_to) {
		const filterFunction = async (toot) => {
			const isReplyToToot = toot.in_reply_to_id === in_reply_to;
			let isFilteredOut = false;

			if (isReplyToToot && this.filter) {
				let isTootByOwner = false;
				let isFavoritedByOwner = false;

				if (this.filter === "favorites") {
					isTootByOwner = toot.account.username === this.user;
					if (!isTootByOwner && toot.favourites_count > 0) {
						const data = await fetch(
							"https://" +
								this.host +
								"/api/v1/statuses/" +
								toot.id +
								"/favourited_by",
						).then((response) => response.json());

						isFavoritedByOwner = data.some(
							(record) => record.username === this.user,
						);
					}

					isFilteredOut = !isTootByOwner && !isFavoritedByOwner;
				}
			}
			return isReplyToToot && !isFilteredOut;
		};

		const tootsToRender = [];
		await Promise.all(
			toots.map(async (toot) => {
				if (await filterFunction(toot)) {
					tootsToRender.push(toot);
				}
			}),
		);

		tootsToRender
			.sort((a, b) => a.created_at.localeCompare(b.created_at))
			.forEach((toot) => {
				this.render_toot(toots, toot);
			});
	}

	render_toot(toots, toot) {
		toot.account.display_name = this.escapeHtml(toot.account.display_name);
		toot.account.emojis.forEach((emoji) => {
			toot.account.display_name = toot.account.display_name.replace(
				`:${emoji.shortcode}:`,
				`<img src="${this.escapeHtml(emoji.static_url)}" alt="Emoji ${
					emoji.shortcode
				}" height="20" width="20" />`,
			);
		});

		const mastodonComment = `
		  <article class="mastodon-comment">
			<div class="author">
			  <div class="avatar">
				<a class="user" href="${
					toot.account.url
				}" rel="nofollow"><img src="${this.escapeHtml(
					toot.account.avatar_static
				)}" height=60 width=60 alt="${
					toot.account.username
				}" loading="lazy">
				</a>
			  </div>
			  <div class="details">
				<a class="name" href="${toot.account.url}" rel="nofollow">${
					toot.account.display_name
				}</a>
				<a class="user" href="${
					toot.account.url
				}" rel="nofollow">${this.user_account(toot.account)}</a>
			  </div>
			  <a class="date" href="${toot.url}" rel="nofollow">
				  <time datetime="${toot.created_at}">
					${this.formatDate(toot.created_at)}${toot.edited_at ? " (*)" : ""}
				  </time>
			  </a>
			</div>
			<div class="content">${toot.content}</div>
			<div class="attachments">
			  ${toot.media_attachments
					.map((attachment) => {
						if (attachment.type === "image") {
							return `<a href="${attachment.url}" rel="ugc nofollow"><img src="${
								attachment.preview_url
							}" alt="${this.escapeHtml(attachment.description)}" loading="lazy" /></a>`;
						} else if (attachment.type === "video") {
							return `<video controls preload="none"><source src="${attachment.url}" type="${attachment.mime_type}"></video>`;
						} else if (attachment.type === "gifv") {
							return `<video autoplay loop muted playsinline><source src="${attachment.url}" type="${attachment.mime_type}"></video>`;
						} else if (attachment.type === "audio") {
							return `<audio controls><source src="${attachment.url}" type="${attachment.mime_type}"></audio>`;
						} else {
							return `<a href="${attachment.url}" rel="ugc nofollow">${attachment.type}</a>`;
						}
					})
					.join("")}
			</div>
			<div class="status">
			  ${this.toot_stats(toot)}
			</div>
		  </article>
	`;

		var li = document.createElement("li");
		li.setAttribute("id", toot.id);
		li.innerHTML =
			typeof DOMPurify !== "undefined"
				? DOMPurify.sanitize(mastodonComment.trim())
				: mastodonComment.trim();

		if (toot.in_reply_to_id === this.tootId) {
			this.querySelector("#mastodon-comments-list").appendChild(li);
		} else {
			const parentToot = toots.find((t) => t.id === toot.in_reply_to_id);
			if (parentToot) {
				const ul = document.createElement("ul");
				this.querySelector(`[id="${toot.in_reply_to_id}"]`)
					.appendChild(ul)
					.appendChild(li);
			}
		}

		this.render_toots(toots, toot.id);
	}

	loadComments() {
		if (this.commentsLoaded) return;

		this.querySelector("#mastodon-comments-list").innerHTML =
			this.locale.loadingText;

		const _this = this;

		fetch(`https://${this.host}/api/v1/statuses/${this.tootId}`)
			.then((response) => response.json())
			.then((toot) => {
				this.querySelector("#mastodon-stats").innerHTML = this.toot_stats(toot);
				this.tootAccountURI = toot.account.uri;
			});

		fetch(`https://${this.host}/api/v1/statuses/${this.tootId}/context`)
			.then((response) => response.json())
			.then((data) => {
				if (
					data.descendants &&
					Array.isArray(data.descendants) &&
					data.descendants.length > 0
				) {
					this.querySelector("#mastodon-comments-list").innerHTML = "";
					_this.render_toots(data.descendants, _this.tootId, 0);
				} else {
					this.querySelector("#mastodon-comments-list").innerHTML =
						`<p>${this.locale.noCommentsText}</p>`;
				}

				_this.commentsLoaded = true;
			});
	}

	respondToVisibility(element, callback) {
		var options = {
			root: null,
		};

		var observer = new IntersectionObserver((entries, observer) => {
			entries.forEach((entry) => {
				if (entry.intersectionRatio > 0) {
					callback();
				}
			});
		}, options);

		observer.observe(element);
	}
}

customElements.define("mastodon-comments", MastodonComments);
