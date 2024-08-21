

export const createMesa = async (req, res) => {
    try {
        
    } catch (error) {
        res.status(500).json({ error: 'Server error' })
    }

}


// export const getMesa = async (req, res) => {
//     try {
//         const mesa = await Mesa.find()
//     } catch (error) {
//         res.status(500).json({ error: 'Server error' })
//     }
// }