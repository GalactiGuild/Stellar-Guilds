import {
    requestAccess,
    getAddress,
    signTransaction as freighterSignTransaction,
    isConnected as freighterIsConnected,
    isAllowed as freighterIsAllowed,
    setAllowed as freighterSetAllowed,
} from '@stellar/freighter-api'
import { WalletAdapter, WalletProvider, StellarNetwork } from '../types'
import { NETWORK_PASSPHRASE } from '../network'

/**
 * Freighter browser-extension wallet adapter.
 *
 * Uses the @stellar/freighter-api named exports:
 *   - isConnected, isAllowed, setAllowed, requestAccess, getAddress, signTransaction
 *
 * @see https://docs.freighter.app/
 */
export class FreighterAdapter implements WalletAdapter {
    readonly name = 'Freighter'
    readonly provider = WalletProvider.FREIGHTER
    readonly icon = '/wallets/freighter.svg'
    readonly installUrl = 'https://www.freighter.app/'

    // ── Detection ────────────────────────────────────────────────────────────

    async isInstalled(): Promise<boolean> {
        try {
            const result = await freighterIsConnected()
            return result.isConnected
        } catch {
            return false
        }
    }

    // ── Connection ───────────────────────────────────────────────────────────

    async connect(): Promise<string> {
        const installed = await this.isInstalled()
        if (!installed) {
            throw new Error(
                'Freighter extension is not installed. Please install it from freighter.app'
            )
        }

        // Request permission if not already granted
        const allowedResult = await freighterIsAllowed()
        if (!allowedResult.isAllowed) {
            const setResult = await freighterSetAllowed()
            if (setResult.error) {
                throw new Error(`Freighter access denied: ${setResult.error}`)
            }
        }

        const accessResult = await requestAccess()
        if (accessResult.error) {
            throw new Error(`Freighter access failed: ${accessResult.error}`)
        }

        const address = accessResult.address
        if (!address) {
            throw new Error('Failed to retrieve address from Freighter')
        }
        return address
    }

    async disconnect(): Promise<void> {
        // Freighter doesn't have a programmatic disconnect — we just clear our
        // local state. The user can revoke access from the extension itself.
    }

    // ── Key Retrieval ────────────────────────────────────────────────────────

    async getPublicKey(): Promise<string> {
        const result = await getAddress()
        if (result.error || !result.address) {
            throw new Error(
                'Unable to get public key. Is Freighter connected?'
            )
        }
        return result.address
    }

    // ── Transaction Signing ──────────────────────────────────────────────────

    async signTransaction(
        xdr: string,
        network: StellarNetwork
    ): Promise<string> {
        const installed = await this.isInstalled()
        if (!installed) {
            throw new Error('Freighter extension is not available')
        }

        try {
            const result = await freighterSignTransaction(xdr, {
                networkPassphrase: NETWORK_PASSPHRASE[network],
            })

            if (result.error) {
                throw new Error(`${result.error}`)
            }

            return result.signedTxXdr
        } catch (err) {
            if (err instanceof Error && err.message.includes('User declined')) {
                throw new Error('Transaction was rejected by the user')
            }
            throw new Error(
                `Failed to sign transaction: ${err instanceof Error ? err.message : 'Unknown error'}`
            )
        }
    }
}
