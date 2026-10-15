// dsh-continue-button — browser half (client plugin bundle).
//
// Loaded by dsh-client-modules at /plugins/dsh-continue-button/client.js and
// executed through the vendored cordis Loader's lazy-CJS module table
// (window.__ModuleLoader__.load). The registered id MUST be the package name
// ("dsh-continue-button"): client-modules keys its boot-graph rows by the
// loader entry's package name and verifies the bundle registers exactly that
// id. The factory body is plain CJS with require() resolved against the
// shell's module table (react, @deepseek-ai/* client packages).
//
// Feature: a "continue" (play) button in the composer's right tool row,
// physically next to the Send icon. A click sends the literal message
// `continue` to the current session through the official conversation
// pipeline (ConversationController.send — the same scoped-session prompt the
// composer's default sink uses for plain messages). The draft is never
// touched.
//
// Visibility rules:
// - hidden while the session is running (s.running — the Stop button is on
//   duty in that state, same signal the InputBar uses);
// - hidden for a blank session (s.blank — a fresh session with no turns,
//   nothing to continue);
// - in the hero/new-chat state (no sessionId) the conversation.input.right
//   slot itself is not rendered, so there is nothing to draw.

window.__ModuleLoader__.load({
	id: "dsh-continue-button",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });

		let react = require("react");
		let jsx = require("react/jsx-runtime");
		let primitives = require("@deepseek-ai/dsh-client-ui-primitives");

		/** Dictionary namespace owned by this plugin. */
		const NS = "dsh-continue-button";
		/** Prompt text sent verbatim as one text block when clicked. */
		const PROMPT = "continue";
		/** Id of the injected <style> node (kept idempotent). */
		const STYLE_ID = "dsh-continue-button-style";
		/** Global class of the button (plain class: CSS modules are not
		 * reachable from a plugin bundle). */
		const CLASS = "dsh-continue-button";

		const en = {
			"button.aria": "Continue",
			"button.title": 'Send "continue" to the session',
		};
		const ru = {
			"button.aria": "Продолжить",
			"button.title": 'Отправить «continue» сессии',
		};

		/**
		 * Inject the button styles once. Idempotent; app CSS variables
		 * (--dsw-*) resolve at paint time, so theme switches keep working.
		 */
		function ensureStyles() {
			if (typeof document === "undefined") return;
			if (document.getElementById(STYLE_ID) !== null) return;
			const style = document.createElement("style");
			style.id = STYLE_ID;
			style.textContent =
				"." + CLASS +
				"{display:inline-flex;align-items:center;justify-content:center;" +
				"box-sizing:border-box;width:28px;height:28px;padding:0;" +
				"border:none;border-radius:var(--dsw-radius-md,6px);" +
				"background:transparent;color:var(--dsw-alias-label-primary,currentColor);" +
				"cursor:pointer;transition:background-color .12s ease}" +
				"." + CLASS + ":hover:not(:disabled)" +
				"{background:var(--dsw-alias-interactive-bg-hover,rgba(127,127,127,.14))}" +
				"." + CLASS + ":active:not(:disabled)" +
				"{background:var(--dsw-alias-interactive-bg-active,rgba(127,127,127,.22))}" +
				"." + CLASS + ":focus-visible" +
				"{outline:2px solid var(--dsw-alias-brand-primary,currentColor);outline-offset:1px}" +
				"." + CLASS + ":disabled{opacity:.45;cursor:default}";
			document.head.appendChild(style);
		}

		/**
		 * Composer continue button.
		 *
		 * @param props - framework kit (useSession, t) + the registrant's
		 *   inject face (sendContinue).
		 */
		function ContinueButton(props) {
			const running = props.useSession((s) => s.running);
			const blank = props.useSession((s) => s.blank);
			const [pending, setPending] = react.useState(false);
			if (running || blank) return null;
			const onActivate = () => {
				if (pending) return;
				setPending(true);
				Promise.resolve(props.sendContinue())
					.catch((err) => {
						// Business failures also land in the session snapshot's
						// promptError; the console copy is for plugin debugging.
						console.error("[dsh-continue-button] send failed:", err);
					})
					.finally(() => setPending(false));
			};
			return jsx.jsx(primitives.Tooltip, {
				label: props.t("button.title"),
				children: jsx.jsx("button", {
					type: "button",
					className: CLASS,
					"aria-label": props.t("button.aria"),
					disabled: pending,
					onClick: onActivate,
					children: jsx.jsx(primitives.IconPlayOutlineRegular, { size: 16 }),
				}),
			});
		}

		/** Services the plugin body reads from the client root context. */
		exports.inject = ["slots", "locale", "sessions"];

		/**
		 * Plugin body: dictionaries + the composer continue button.
		 * @param ctx - client root context.
		 */
		exports.apply = (ctx) => {
			ctx.effect(() => ctx.locale.register(NS, { en, ru }), "continue-button: dictionaries");
			ctx.effect(() => ensureStyles(), "continue-button: styles");
			ctx.slots.inject("conversation.input.right", () =>
				ctx.slots.register({
					name: "conversation.input.right",
					id: "continue-button",
					order: 10,
					locale: NS,
					inject: (sessionId) => {
						const actx = ctx.sessions.scope(sessionId);
						if (actx === void 0)
							throw new Error(`continue-button: session "${sessionId}" resolved no scope`);
						const conversation = actx.get("conversation");
						if (conversation === void 0)
							throw new Error("continue-button: conversation service unavailable");
						return {
							sendContinue: () => conversation.send(PROMPT),
						};
					},
				}, ContinueButton)
			);
		};

		return module.exports;
	},
});
