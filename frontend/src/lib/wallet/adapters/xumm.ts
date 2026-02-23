import { WalletAdapter, WalletProvider } from '../types'

/**
 * XUMM wallet adapter.
 *
 * XUMM uses a QR-code / redirect based sign-in flow via the xumm SDK.
 * Unlike Freighter (a browser extension), XUMM is primarily a mobile app
 * so the connection flow is inherently asynchronous and cross-device.
 *
 * @see https://docs.xumm.dev/
 */

// Lazy-loaded XUMM SDK instance to avoid SSR issues with Next.js
let xummInstance: unknown | null = null

async function getXumm() {
    if (xummInstance) return xummInstance

    try {
        const { Xumm } = await import('xumm')
        // API key should be provided via environment variable
        const apiKey = process.env.NEXT_PUBLIC_XUMM_API_KEY || ''
        if (!apiKey) {
            console.warn(
                'XUMM API key not configured. Set NEXT_PUBLIC_XUMM_API_KEY in your environment.'
            )
        }
        xummInstance = new Xumm(apiKey)
        return xummInstance
    } catch {
        throw new Error('Failed to initialize XUMM SDK')
    }
}

export class XummAdapter implements WalletAdapter {
    readonly name = 'XUMM'
    readonly provider = WalletProvider.XUMM
    readonly icon = '/wallets/xumm.svg'
    readonly installUrl = 'https://xumm.app/'

    private publicKey: string | null = null

    // ── Detection ────────────────────────────────────────────────────────────

    async isInstalled(): Promise<boolean> {
        // XUMM is always "available" since it works via QR codes / deep links.
        // The SDK itself is the bridge — no browser extension required.
        return true
    }

    // ── Connection ───────────────────────────────────────────────────────────

    async connect(): Promise<string> {
        try {
            const xumm = (await getXumm()) as {
                authorize: () => Promise<{ me?: { account?: string } } | undefined>
            }

            const authorization = await xumm.authorize()

            const account = authorization?.me?.account
            if (!account) {
                throw new Error('XUMM authorization did not return an account')
            }

            this.publicKey = account
            return account
        } catch (err) {
            if (err instanceof Error && err.message.includes('closed')) {
                throw new Error('XUMM sign-in was cancelled by the user')
            }
            throw new Error(
                `XUMM connection failed: ${err instanceof Error ? err.message : 'Unknown error'}`
            )
        }
    }

    async disconnect(): Promise<void> {
        try {
            const xumm = (await getXumm()) as {
                logout: () => Promise<void>
            }
            await xumm.logout()
        } catch {
            // Swallow errors during logout — the important thing is clearing local state
        } finally {
            this.publicKey = null
        }
    }

    // ── Key Retrieval ────────────────────────────────────────────────────────

    async getPublicKey(): Promise<string> {
        if (!this.publicKey) {
            throw new Error('XUMM is not connected. Call connect() first.')
        }
        return this.publicKey
    }

    // ── Transaction Signing ──────────────────────────────────────────────────

    async signTransaction(
        xdr: string
    ): Promise<string> {
        try {
            const xumm = (await getXumm()) as {
                payload: {
                    createAndSubscribe: (
                        payload: { txblob: string },
                        callback: (event: { data: { signed: boolean } }) => Promise<void>
                    ) => Promise<{ resolved: { response: { hex?: string } } }>
                }
            }

            const subscription = await xumm.payload.createAndSubscribe(
                { txblob: xdr },
                async (event) => {
                    // The callback fires on each status update. We wait until signed.
                    if (event.data.signed === false) {
                        throw new Error('Transaction was rejected by the user')
                    }
                }
            )

            const signedHex = subscription?.resolved?.response?.hex
            if (!signedHex) {
                throw new Error('No signed transaction returned from XUMM')
            }

            return signedHex
        } catch (err) {
            throw new Error(
                `XUMM signing failed: ${err instanceof Error ? err.message : 'Unknown error'}`
            )
        }
    }
}
