import React from 'react'
import { Link } from 'gatsby'
import { Layout } from '../components/common'

const NotFoundPage = () => (
    <Layout>
        <div className="container">
            <article className="content" style={{ textAlign: `center` }}>
                <h1 className="content-title">Error 404</h1>
                <section className="content-body">
                    Page not found, <Link to="/">return home</Link> to start over
                </section>
            </article>
        </div>
    </Layout>
)

export default NotFoundPage
